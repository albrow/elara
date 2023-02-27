import { indentWithTab } from "@codemirror/commands";
import { lintGutter, setDiagnostics, Diagnostic } from "@codemirror/lint";
import { keymap, EditorView } from "@codemirror/view";
import { useCodeMirror } from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { Box } from "@chakra-ui/react";

import { highlightLine, unhighlightAll } from "../../lib/highlight_line";
import {
  FuzzyStateWithLine,
  LinePos,
  RhaiError,
  RunResult,
} from "../../../elara-lib/pkg";
import { rhaiSupport } from "../../lib/cm_rhai_extension";
import "./editor.css";
import { highlightHoverable } from "../../lib/highlight_hoverable";
import { Replayer } from "../../lib/replayer";
import { hoverDocs } from "./hover_docs";
import ControlBar from "./control_bar";

export type EditorState = "editing" | "running" | "paused";

const extensions = [
  lintGutter(),
  keymap.of([indentWithTab]),
  rhaiSupport(),
  hoverDocs,
  highlightHoverable,
];

export interface CodeError {
  line: number;
  col: number;
  message: string;
}

export type EditorType = "level" | "example";

const myTheme = createTheme({
  theme: "light",
  settings: {
    background: "#ffffff",
    foreground: "#000000",
    caret: "var(--chakra-colors-gray-700)",
    selection: "var(--chakra-colors-gray-300)",
    selectionMatch: "var(--chakra-colors-green-200)",
    lineHighlight: "transparent",
    gutterBackground: "var(--chakra-colors-gray-200)",
    gutterForeground: "var(--chakra-colors-gray-500)",
    gutterBorder: "var(--chakra-colors-gray-300)",
  },
  styles: [
    {
      tag: t.comment,
      class: "cm-comment",
    },
    {
      tag: t.string,
      class: "cm-string",
    },
  ],
});

function codeErrorToDiagnostic(view: EditorView, e: CodeError): Diagnostic {
  // In Rhai, positions are composed of (line, column), but
  // CodeMirror wants the absolute position. We need to do
  // some math to convert between the two.
  //
  // For now, we just want to highlight the entire line where
  // the error occurred.
  const line = view.viewportLineBlocks[e.line - 1];

  if (line.length === 0) {
    // This should never happen, but it in practice it sometimes occurs
    // if the line only contains whitespace. If this does happen, just
    // highlight the first character of the line.
    return {
      from: line.from,
      to: line.from,
      message: e.message,
      severity: "error",
    };
  }

  return {
    from: line.from,
    to: line.from + line.length - 1,
    message: e.message,
    severity: "error",
  };
}

let replayer: Replayer | null = null;

interface EditorProps {
  // The starting code (e.g. inivial level code or user code loaded from local storage).
  code: string;
  // E.g., the original code for the level or runnable example. The code that we will reset to.
  originalCode: string;
  type: EditorType;
  runScript: (script: string) => RunResult;
  onReplayDone: (script: string, result: RunResult) => void;
  // A handler for unexpected exceptions that occur when running the script.
  onScriptError: (script: string, error: Error) => void;
  onStep?: (step: FuzzyStateWithLine) => void;
  onCancel?: (script: string) => void;
}

export default function Editor(props: EditorProps) {
  const editor = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<EditorState>("editing");
  const [activeLine, setActiveLine] = useState<LinePos | null>(null);
  const [codeError, setCodeError] = useState<CodeError | null>(null);

  const height = props.type === "level" ? "377px" : undefined;
  const sizeClass = props.type === "level" ? "level-sized" : undefined;

  const { setContainer, view } = useCodeMirror({
    height,
    editable: state === "editing",
    readOnly: state !== "editing",
    container: editor.current,
    extensions,
    value: props.code,
    theme: myTheme,
  });

  useEffect(
    () => () => {
      // When the component is unmounted, stop the replayer.
      if (replayer) {
        replayer.stop();
      }
    },
    []
  );

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer]);

  useEffect(() => {
    if (view) {
      if (activeLine) {
        highlightLine(view, activeLine.line);
      } else {
        unhighlightAll(view);
      }
    }
  }, [activeLine, view]);

  useEffect(() => {
    if (view) {
      if (codeError) {
        const diagnostic = codeErrorToDiagnostic(view, codeError);
        view.dispatch(setDiagnostics(view.state, [diagnostic]));
      } else {
        view.dispatch(setDiagnostics(view.state, []));
      }
    }
  }, [codeError, view]);

  const getCode = useCallback(
    () => view?.state.doc.toString() || "",
    [view?.state.doc]
  );

  const setCode = useCallback(
    (code: string) => {
      view?.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: code,
        },
      });
    },
    [view]
  );

  // If the initial code changes, update the CodeMirror view.
  useEffect(() => {
    setCode(props.code);
  }, [props.code, setCode]);

  const onReplayStep = useCallback(
    (step: FuzzyStateWithLine) => {
      if (step.line_pos) {
        setActiveLine(step.line_pos);
      }
      if (props.onStep) {
        props.onStep(step);
      }
    },
    [props]
  );

  const makeOnReplayDoneHandler = useCallback(
    (script: string, result: RunResult) => () => {
      setState("editing");
      setActiveLine(null);
      setCodeError(null);
      props.onReplayDone(script, result);
    },
    [props]
  );

  // When the "run" button is clicked, run the code and set up the replayer.
  const onRun = useCallback(() => {
    const script = getCode();
    let result: RunResult;
    try {
      result = props.runScript(script);
    } catch (e) {
      if (e instanceof RhaiError && e.line) {
        // If there is a RhaiError (e.g. a syntax error) *with* a line number,
        // display it in the editor.
        setCodeError({
          line: e.line,
          col: e.col,
          message: e.message,
        });
        return;
      }
      if (e instanceof Error) {
        // If there was another kind of error, call the onScriptError handler.
        props.onScriptError(script, e as Error);
        return;
      }
      // If we got a non-Error object, just rethrow it. This is really unexpected.
      console.error("Unexpected exception with a non-error type!");
      console.error(e);
      throw e;
    }
    if (replayer) {
      replayer.stop();
    }
    replayer = new Replayer(
      result.states,
      onReplayStep,
      makeOnReplayDoneHandler(script, result)
    );
    // Start the replay in the "paused" state.
    setState("paused");
  }, [getCode, makeOnReplayDoneHandler, onReplayStep, props]);

  const onCancel = useCallback(() => {
    setState("editing");
    if (props.onCancel) {
      props.onCancel(getCode());
    }
    if (replayer) {
      replayer.stop();
    }
  }, [getCode, props]);

  const onPlay = useCallback(() => {
    setState("running");
    if (replayer) {
      replayer.start();
    }
  }, []);

  const onPause = useCallback(() => {
    setState("paused");
    if (replayer) {
      replayer.pause();
    }
  }, []);

  const onStepForward = useCallback(() => {
    if (replayer) {
      replayer.stepForward();
    }
  }, []);

  const onStepBack = useCallback(() => {
    if (replayer) {
      replayer.stepBackward();
    }
  }, []);

  const onDownload = useCallback(async () => {
    // TODO(albrow): Implement this.
    console.log("download code pressed");
  }, []);

  const onUpload = useCallback(async () => {
    // TODO(albrow): Implement this.
    console.log("upload code pressed");
  }, []);

  // Reset the code to its initial state for the current
  // level (regardless of what has been saved in the save
  // data).
  const onReset = useCallback(() => {
    setCode(props.originalCode);
  }, [props.originalCode, setCode]);

  // useEffect(() => {
  //   const keyListener = async (event: KeyboardEvent) => {
  //     if ((event.ctrlKey || event.metaKey) && event.key === "s") {
  //       // Save on Ctrl + S or Cmd + S
  //       await saveCodeHandler();
  //       event.preventDefault();
  //       return false;
  //     }
  //     // Run the script on Shift + Enter
  //     if (event.shiftKey && event.key === "Enter" && !isRunning) {
  //       runHandler();
  //       event.preventDefault();
  //       return false;
  //     }
  //     // Stop running the script on Escape.
  //     if (event.key === "Escape" && isRunning) {
  //       stopHandler();
  //       event.preventDefault();
  //       return false;
  //     }
  //     return Promise.resolve();
  //   };
  //   document.addEventListener("keydown", keyListener);
  //   return () => {
  //     document.removeEventListener("keydown", keyListener);
  //   };
  // }, [isRunning, runHandler, saveCodeHandler, stopHandler]);

  return (
    <>
      <ControlBar
        editorState={state}
        onRun={onRun}
        onCancel={onCancel}
        onPause={onPause}
        onStepForward={onStepForward}
        onStepBack={onStepBack}
        onPlay={onPlay}
        onDownload={onDownload}
        onUpload={onUpload}
        onReset={onReset}
      />
      <Box id="editor-wrapper" className={sizeClass}>
        <div ref={editor} />
      </Box>
    </>
  );
}
