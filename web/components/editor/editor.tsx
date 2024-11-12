import { Box, Text, Tooltip } from "@chakra-ui/react";
import { acceptCompletion, completionStatus } from "@codemirror/autocomplete";
import { indentLess, indentMore } from "@codemirror/commands";
import { Diagnostic, lintGutter, setDiagnostics } from "@codemirror/lint";
import { Compartment } from "@codemirror/state";
import { EditorView, KeyBinding, keymap } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { useWindowSize } from "@uidotdev/usehooks";
import { createTheme } from "@uiw/codemirror-themes";
import { useCodeMirror } from "@uiw/react-codemirror";
import debounce from "lodash.debounce";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Unsubscribe } from "router5/dist/types/base";
import { useRouter } from "react-router5";

import {
  RhaiError,
  RunResult,
  StateWithLines,
  // eslint-disable-next-line camelcase
  get_compact_code_len,
} from "../../../elara-lib/pkg";
import { rhaiSupport } from "../../lib/cm_rhai_extension";
import { CODE_LEN_EXPLANATION } from "../../lib/constants";
import { highlightLines, unhighlightAll } from "../../lib/highlight_line";
import { Replayer } from "../../lib/replayer";
import { BP_LG, BP_XL, EDITOR_BORDER_WIDTH } from "../../lib/responsive_design";
import ControlBar from "./control_bar";
import "./editor.css";
import { textEffects } from "./text_effects";

const CODE_LENGTH_COUNTER_OFFSET = 16;

export type EditorState = "editing" | "running" | "paused";

// Used to reconfigure some extensions on the fly so we can change the
// available functions (e.g., which functions are auto-completed).
// See: https://codemirror.net/docs/ref/#state.Compartment
// Also see: https://codemirror.net/examples/config/#compartments
const languageCompartment = new Compartment();
const textEffectsCompartment = new Compartment();

function setAvailableAndDisabledFuncs(
  view: EditorView,
  availableFuncs: string[],
  disabledFuncs: string[]
) {
  view.dispatch({
    effects: [
      languageCompartment.reconfigure(rhaiSupport(availableFuncs)),
      textEffectsCompartment.reconfigure(
        textEffects(availableFuncs, disabledFuncs)
      ),
    ],
  });
}

// We use a custom tab keybinding to change the default behavior. For our
// purposes, we want to use tab to either accept an autocomplete option or
// to increase/decrease the indentation level.
const completeOrIndentWithTab: KeyBinding[] = [
  {
    key: "Tab",
    run: (view: EditorView) => {
      if (completionStatus(view.state)) {
        // Select and insert the currently selected autocomplete option.
        return acceptCompletion(view);
      }
      // Otherwise, use the default behavior of increasing indent level.
      return indentMore(view);
    },
    shift: indentLess,
  },
];

const extensions = [
  lintGutter(),
  // keymap.of([indentWithTab]),
  keymap.of(completeOrIndentWithTab),
  languageCompartment.of(rhaiSupport([])),
  textEffectsCompartment.of(textEffects([], [])),
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

interface EditorProps {
  // The starting code (e.g. inivial level code or user code loaded from local storage).
  code: string;
  // E.g., the original code for the level or runnable example. The code that we will reset to.
  originalCode: string;
  // Editor state requested by the parent component.
  requestedState: EditorState | null;
  // type is either "level" or "example".
  type: EditorType;
  runScript: (script: string) => RunResult;
  onReplayDone: (script: string, result: RunResult) => void;
  // A handler for unexpected exceptions that occur when running the script.
  onScriptError: (script: string, error: Error) => void;
  // Which built-in functions should be considered available. These functions
  // will have autocomplete and hover docs enabled.
  availableFunctions: string[];
  // Which functions are disabled for this level (if any).
  disabledFunctions?: string[];
  onStep?: (step: StateWithLines) => void;
  onCancel?: (script: string) => void;
  onStateChange?: (state: EditorState) => void;
  // Whether to automatically reset the editor state when the replay is done.
  // (default: true).
  resetOnReplayDone?: boolean;
  // An optional callback that can be used, e.g., to save the code to local storage.
  persistCode?: (script: string) => void;
  // Whether the code length counter should be displayed (default: true).
  showCodeLenCounter?: boolean;
}

export default function Editor(props: EditorProps) {
  // editor is a reference to HTML div which will hold the CodeMirror editor.
  const editor = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<EditorState>("editing");
  const [activeLines, setActiveLines] = useState<number[]>([]);
  const [codeError, setCodeError] = useState<CodeError | null>(null);
  const replayer = useRef<Replayer | null>(null);
  const [numSteps, setNumSteps] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const router = useRouter();

  // possiblyOutdatedCode is used in conjunction with debounce to
  // perform certain updates when the code changes.
  const [possiblyOutdatedCode, setPossiblyOutdatedCode] = useState<string>(
    props.code
  );

  // codeLength is the length of the compacted code (i.e. not counting
  // comments or non-significant whitespace). Shown in the UI and used
  // for some challenges.
  const [codeLength, setCodeLength] = useState<number | undefined>(
    get_compact_code_len(props.code)
  );

  // We want to take some actions on every key stroke, but we don't want
  // to do actual work on every single key stroke. We use the debounce
  // function to only call the function after the user has stopped typing
  // for a certain amount of time.
  const onCodeChange = useMemo(
    () =>
      debounce(
        (code: string) => {
          if (code !== possiblyOutdatedCode) {
            setPossiblyOutdatedCode(code);

            // Remove any existing error.
            setCodeError(null);

            // Update code length counter.
            const compactLen = get_compact_code_len(code);
            setCodeLength(compactLen);
          }
        },
        200,
        { maxWait: 1500 }
      ),
    [possiblyOutdatedCode]
  );

  // Note: We have to use JavaScript to control the size of the editor because
  // CodeMirror requires you to pass in the height as a string.
  const windowSize = useWindowSize();

  const codeMirrorHeight = useMemo(() => {
    if (props.type === "level") {
      if (windowSize.width && windowSize.width >= BP_XL) {
        return 380;
      }
      if (windowSize.width && windowSize.width >= BP_LG) {
        return 309;
      }
      return 288;
    }
    return undefined;
  }, [props.type, windowSize]);

  const editorWrapperHeight = codeMirrorHeight
    ? `${codeMirrorHeight + EDITOR_BORDER_WIDTH}px`
    : undefined;

  const { setContainer, view } = useCodeMirror({
    height: codeMirrorHeight ? `${codeMirrorHeight}px` : "auto",
    editable: state === "editing",
    readOnly: state !== "editing",
    indentWithTab: false,
    container: editor.current,
    extensions,
    value: props.code,
    theme: myTheme,
    onChange: onCodeChange,
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

  const { onStateChange } = props;
  useLayoutEffect(() => {
    // Call the onStateChange handler whenever the state changes.
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, onStateChange]);

  const resetState = useCallback(() => {
    setState("editing");
    setActiveLines([]);
    setCodeError(null);
    setStepIndex(0);
    setNumSteps(0);
  }, []);

  // Respond to a requested state change.
  useEffect(() => {
    if (props.requestedState === null) {
      // Just means a state is not being requested by the parent.
      return;
    }
    if (props.requestedState === "editing") {
      // If the requested state is "editing", stop the replayer and reset the state.
      if (replayer.current) {
        replayer.current.stop();
      }
      resetState();
    } else {
      // Requesting other states is not allowed.
      throw new Error(`Invalid requested state: ${props.requestedState}`);
    }
  }, [props.requestedState, resetState]);

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

  // Handle route changes.
  useEffect(() => {
    const unsubscribe = router.subscribe((_transition) => {
      // Persist the code if there is a handler provided.
      if (props.persistCode) {
        props.persistCode(getCode());
      }
      // Stop the replayer if it is running.
      if (replayer.current) {
        replayer.current.stop();
      }
      // Reset the state.
      resetState();
    }) as Unsubscribe;
    return unsubscribe;
  }, [getCode, props, resetState, router]);

  useEffect(() => {
    // Update the available functions when needed.
    if (view) {
      setAvailableAndDisabledFuncs(
        view,
        props.availableFunctions,
        props.disabledFunctions || []
      );
    }
  }, [props.availableFunctions, props.disabledFunctions, view]);

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer]);

  useEffect(() => {
    if (view) {
      if (activeLines && activeLines.length > 0) {
        highlightLines(view, activeLines);
      } else {
        unhighlightAll(view);
      }
    }
  }, [activeLines, view]);

  useEffect(() => {
    if (view) {
      if (codeError != null) {
        const diagnostic = codeErrorToDiagnostic(view, codeError);
        // Note(albrow): I'm not even going to pretend to understand why this
        // setTimeout is necessary. Without it, the error message is not displayed
        // in the editor unless you click the "deploy" button a second time. 🐲 🤷‍♂️
        //
        // DON'T REMOVE THIS.
        setTimeout(
          () => view.dispatch(setDiagnostics(view.state, [diagnostic])),
          1
        );
      } else {
        view.dispatch(setDiagnostics(view.state, []));
      }
    }
  }, [codeError, view]);

  // If the initial code changes, update the CodeMirror view.
  useEffect(() => {
    setCode(props.code);
  }, [props.code, setCode]);

  const onReplayStep = useCallback(
    (i: number, step: StateWithLines) => {
      setStepIndex(i);
      if (step.lines) {
        setActiveLines(step.lines);
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
      } else {
        setState("paused");
      }
      props.onReplayDone(script, result);
    },
    [props, resetState]
  );

  // Deploys the code (i.e. runs the script and gets the resulting states). If
  // playImmediately is true, starts the replayer immediately. Otherwise,
  // waits for the user to click the "play" button.
  const deployCode = useCallback(
    (playImmediately: boolean) => {
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
      onReplayStep(0, result.states[0]);
      setNumSteps(result.stats.time_taken);
      if (replayer.current) {
        replayer.current.stop();
      }
      replayer.current = new Replayer(
        result.states,
        onReplayStep,
        makeOnReplayDoneHandler(script, result)
      );
      if (playImmediately) {
        // Immediately start the replay.
        setState("running");
        replayer.current.start();
      } else {
        // Start the replay in the "paused" state.
        setState("paused");
      }
    },
    [getCode, makeOnReplayDoneHandler, onReplayStep, props, resetState]
  );

  // When the "deploy" button is clicked, run the code and set up the replayer.
  const onDeploy = useCallback(() => {
    deployCode(false);
  }, [deployCode]);

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

  // Reset the code to its initial state for the current
  // level (regardless of what has been saved in the save
  // data).
  const onReset = useCallback(() => {
    setCode(props.originalCode);
  }, [props.originalCode, setCode]);

  useEffect(() => {
    const keyListener = async (event: KeyboardEvent) => {
      const modifierPressed = event.shiftKey || event.ctrlKey || event.metaKey;
      if (
        view &&
        view.hasFocus &&
        modifierPressed &&
        event.key === "Enter" &&
        state === "editing"
      ) {
        // Deploy and run the script on Shift+Enter, Cmd+Enter, or Ctrl+Enter,
        // but only if this editor has focus.
        deployCode(true);
        event.preventDefault();
      } else if (event.key === "Escape" && state === "running") {
        // Stop running the script on Escape.
        onCancel();
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", keyListener);
    return () => {
      document.removeEventListener("keydown", keyListener);
    };
  }, [onCancel, state, view, deployCode]);

  return (
    <>
      <ControlBar
        editorState={state}
        availableFunctions={props.availableFunctions}
        onDeploy={onDeploy}
        onCancel={onCancel}
        onPause={onPause}
        onStepForward={onStepForward}
        onStepBack={onStepBack}
        onPlay={onPlay}
        onReset={onReset}
        stepIndex={stepIndex}
        numSteps={numSteps}
        onSliderChange={onSliderChange}
      />
      <Box
        id="editor-wrapper"
        height={editorWrapperHeight}
        borderWidth={`${EDITOR_BORDER_WIDTH}px`}
        borderTop="0px"
        background="gray.100"
        borderColor="gray.700"
        borderBottomRightRadius="0.375rem"
        borderBottomLeftRadius="0.375rem"
        // fontSize={BODY_RESPONSIVE_FONT_SCALE}
      >
        <div
          ref={editor}
          className={props.type === "level" ? "editor-level" : "editor-example"}
        />
      </Box>
      {props.showCodeLenCounter && (
        <Box
          position="absolute"
          bg="gray.700"
          bottom={`${CODE_LENGTH_COUNTER_OFFSET - 2}px`}
          right={`${CODE_LENGTH_COUNTER_OFFSET}px`}
          px="7px"
          py="2px"
          borderRadius="0.375rem"
          opacity="50%"
        >
          <Tooltip
            // fontSize={BODY_RESPONSIVE_FONT_SCALE}
            label={CODE_LEN_EXPLANATION}
            placement="top"
            hasArrow
          >
            <Text
              verticalAlign="center"
              as="div"
              fontSize={{
                base: "0.7rem",
                xl: "0.8rem",
                // "2xl": "0.9rem",
                // "3xl": "1.1rem",
              }}
              color="white"
              _hover={{ cursor: "help" }}
            >
              {codeLength == null ? "???" : codeLength} chars
            </Text>
          </Tooltip>
        </Box>
      )}
    </>
  );
}

Editor.defaultProps = {
  showCodeLenCounter: true,
};
