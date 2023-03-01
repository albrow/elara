import { indentWithTab } from "@codemirror/commands";
import { lintGutter, setDiagnostics, Diagnostic } from "@codemirror/lint";
import { keymap, EditorView } from "@codemirror/view";
import { useCodeMirror } from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { Box } from "@chakra-ui/react";
import { Compartment } from "@codemirror/state";

import { highlightLine, unhighlightAll } from "../../lib/highlight_line";
import {
  FuzzyStateWithLine,
  LinePos,
  RhaiError,
  RunResult,
} from "../../../elara-lib/pkg";
import { rhaiSupport } from "../../lib/cm_rhai_extension";
import "./editor.css";
import { Replayer } from "../../lib/replayer";
import { loadCode, saveCode } from "../../lib/file_system";
import { hoverDocs } from "./hover_docs";
import ControlBar from "./control_bar";

export type EditorState = "editing" | "running" | "paused";

// Used to reconfigure some extensions on the fly so we can change the
// available functions (i.e. which functions are auto-completed).
// See: https://codemirror.net/docs/ref/#state.Compartment
// Also see: https://codemirror.net/examples/config/#compartments
const languageCompartment = new Compartment();
const hoverDocsCompartment = new Compartment();

function setAvailableFuncs(view: EditorView, funcs: string[]) {
  view.dispatch({
    effects: [
      languageCompartment.reconfigure(rhaiSupport(funcs)),
      hoverDocsCompartment.reconfigure(hoverDocs(funcs)),
    ],
  });
}

const extensions = [
  lintGutter(),
  keymap.of([indentWithTab]),
  languageCompartment.of(rhaiSupport([])),
  hoverDocsCompartment.of(hoverDocs([])),
];

export interface CodeError {
  line: number;
  col: number;
  message: string;
}

export type EditorType = "level" | "example" | "demo";

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
  // Which built-in functions should be considered available. These functions
  // will have autocomplete and hover docs enabled.
  availableFunctions: string[];
  onStep?: (step: FuzzyStateWithLine) => void;
  onCancel?: (script: string) => void;
  // Whether to automatically reset the editor state when the replay is done.
  // (default: true).
  resetOnReplayDone?: boolean;
}

export default function Editor(props: EditorProps) {
  const editor = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<EditorState>("editing");
  const [activeLine, setActiveLine] = useState<LinePos | null>(null);
  const [codeError, setCodeError] = useState<CodeError | null>(null);
  const replayer = useRef<Replayer | null>(null);
  const [numSteps, setNumSteps] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const { setContainer, view } = useCodeMirror({
    height: props.type === "level" || props.type === "demo" ? "377px" : "auto",
    editable: state === "editing",
    readOnly: state !== "editing",
    indentWithTab: false,
    container: editor.current,
    extensions,
    value: props.code,
    theme: myTheme,
  });

  useEffect(
    () => () => {
      // When the component is unmounted, stop the replayer.
      if (replayer.current) {
        replayer.current.stop();
      }
    },
    []
  );

  useEffect(() => {
    // Update the available functions when needed.
    if (view) {
      setAvailableFuncs(view, props.availableFunctions);
    }
  }, [props.availableFunctions, view]);

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

  const resetState = useCallback(() => {
    setState("editing");
    setActiveLine(null);
    setCodeError(null);
    setStepIndex(0);
    setNumSteps(0);
  }, []);

  // If the initial code changes, update the CodeMirror view.
  useEffect(() => {
    setCode(props.code);
  }, [props.code, setCode]);

  const onReplayStep = useCallback(
    (i: number, step: FuzzyStateWithLine) => {
      setStepIndex(i);
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
      if (props.resetOnReplayDone) {
        resetState();
      }
      props.onReplayDone(script, result);
    },
    [props, resetState]
  );

  // When the "deploy" button is clicked, run the code and set up the replayer.
  const onDeploy = useCallback(() => {
    resetState();
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
    setStepIndex(0);
    setNumSteps(result.states.length);
    if (replayer.current) {
      replayer.current.stop();
    }
    replayer.current = new Replayer(
      result.states,
      onReplayStep,
      makeOnReplayDoneHandler(script, result)
    );
    // Start the replay in the "paused" state.
    setState("paused");
  }, [getCode, makeOnReplayDoneHandler, onReplayStep, props, resetState]);

  const onCancel = useCallback(() => {
    resetState();
    if (props.onCancel) {
      props.onCancel(getCode());
    }
    if (replayer.current) {
      replayer.current.stop();
    }
  }, [getCode, props, resetState]);

  const onPlay = useCallback(() => {
    setState("running");
    if (replayer.current) {
      replayer.current.start();
    }
  }, []);

  const onPause = useCallback(() => {
    setState("paused");
    if (replayer.current) {
      replayer.current.pause();
    }
  }, []);

  const onStepForward = useCallback(() => {
    if (replayer.current) {
      replayer.current.stepForward();
    }
  }, []);

  const onStepBack = useCallback(() => {
    if (replayer.current) {
      replayer.current.stepBackward();
    }
  }, []);

  const onSliderChange = useCallback((value: number) => {
    if (replayer.current) {
      replayer.current.goToStep(value);
    }
    setState("paused");
  }, []);

  const onDownload = useCallback(async () => {
    await saveCode(getCode());
  }, [getCode]);

  const onUpload = useCallback(async () => {
    const loadedCode = await loadCode();
    setCode(loadedCode);
  }, [setCode]);

  // Reset the code to its initial state for the current
  // level (regardless of what has been saved in the save
  // data).
  const onReset = useCallback(() => {
    setCode(props.originalCode);
  }, [props.originalCode, setCode]);

  useEffect(() => {
    const keyListener = async (event: KeyboardEvent) => {
      // If the editor has focus, we want to handle keyboard shortcuts.
      // Otherwise don't handle them.
      if (!view || !view.hasFocus) {
        return;
      }
      // Run the script on Shift+Enter, Cmd+Enter, or Ctrl+Enter.
      // Also start playing immediately.
      const modifierPressed = event.shiftKey || event.ctrlKey || event.metaKey;
      if (modifierPressed && event.key === "Enter" && state === "editing") {
        onDeploy();
        onPlay();
        event.preventDefault();
      }
      // Stop running the script on Escape.
      if (event.key === "Escape" && state === "running") {
        onCancel();
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", keyListener);
    return () => {
      document.removeEventListener("keydown", keyListener);
    };
  }, [onCancel, onPlay, onDeploy, state, view]);

  return (
    <>
      <ControlBar
        editorState={state}
        onDeploy={onDeploy}
        onCancel={onCancel}
        onPause={onPause}
        onStepForward={onStepForward}
        onStepBack={onStepBack}
        onPlay={onPlay}
        onDownload={onDownload}
        onUpload={onUpload}
        onReset={onReset}
        stepIndex={stepIndex}
        numSteps={numSteps}
        onSliderChange={onSliderChange}
        sliderSize={props.type === "demo" ? "small" : "full"}
      />
      <Box
        id="editor-wrapper"
        height={
          props.type === "level" || props.type === "demo" ? "381px" : undefined
        }
        borderWidth="2px"
        borderTop="0px"
        paddingBottom="2px"
        background="gray.100"
        borderColor="gray.700"
        borderBottomRightRadius="0.375rem"
        borderBottomLeftRadius="0.375rem"
      >
        <div
          ref={editor}
          className={
            props.type === "level" || props.type === "demo"
              ? "editor-level"
              : "editor-example"
          }
        />
      </Box>
    </>
  );
}

Editor.defaultProps = {
  resetOnReplayDone: true,
};
