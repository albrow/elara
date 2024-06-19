import { Box, Stack } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";

import { SANDBOX_LEVEL } from "../../lib/scenes";
import Editor, { EditorState } from "../editor/editor";
import {
  Game,
  StateWithLines,
  RunResult,
  LevelData,
} from "../../../elara-lib/pkg/elara_lib";
import { useErrorModal } from "../../hooks/error_modal_hooks";
import { useSaveData } from "../../hooks/save_data_hooks";
import { ErrorType } from "../../contexts/error_modal";
import MiniBoard from "./mini_board";

export interface RunnableExampleProps {
  code: string;
  level?: LevelData;
}

export default function RunnableExample(props: RunnableExampleProps) {
  const game = Game.new();
  const initialState = props.level!.initial_state;

  // Note: unsafeSetEditorState should only be called in response to an onStateChange
  // event from the Editor component. It does not actually change the state inside the
  // Editor component.
  const [editorState, unsafeSetEditorState] = useState<EditorState>("editing");
  const [showErrorModal, _hidErrorModal, setErrorModalOnClose] =
    useErrorModal();
  const [saveData, _] = useSaveData();

  // If the initial code is short, add some extra lines
  // to make the editor look better.
  let initialCode = props.code;
  while (initialCode.split("\n").length < 4) {
    initialCode += "\n";
  }
  const [boardState, setBoardState] = useState(initialState);

  const availFuncs = useMemo(
    () => saveData.unlockedFunctions,
    [saveData.unlockedFunctions]
  );

  const resetState = useCallback(() => {
    setBoardState(initialState);
  }, [initialState]);

  const runScript = useCallback(
    (script: string) =>
      game.run_player_script(props.level!.short_name, availFuncs, script),
    [availFuncs, game, props.level]
  );

  const onReplayDone = useCallback(
    (_script: string, result: RunResult) => {
      if (!["success", "continue", "no_objective"].includes(result.outcome)) {
        setErrorModalOnClose(resetState);
        const modalKind = result.outcome === "continue" ? "continue" : "error";
        const modalError =
          result.outcome === "continue" ? undefined : result.outcome;
        const modalErrType = result.err_type as ErrorType;
        showErrorModal(modalKind, modalError, modalErrType);
      }
      resetState();
    },
    [resetState, setErrorModalOnClose, showErrorModal]
  );

  const onEditorStep = useCallback((step: StateWithLines) => {
    setBoardState(step.state);
  }, []);

  const onEditorStateChange = useCallback((state: EditorState) => {
    unsafeSetEditorState(state);
  }, []);

  const onScriptError = useCallback(
    (_script: string, error: Error) => {
      setErrorModalOnClose(resetState);
      showErrorModal("error", error.message);
    },
    [resetState, setErrorModalOnClose, showErrorModal]
  );

  const onScriptCancel = useCallback(() => {
    resetState();
  }, [resetState]);

  return (
    <Stack
      className="runnable-example"
      direction="row"
      mb="50px"
      mt="25px"
      mx="auto"
      width="fit-content"
    >
      <Box
        width={{
          base: "500px",
          xl: "550px",
          // "2xl": "600px",
          // "3xl": "750px",
        }}
      >
        <Editor
          type="example"
          code={initialCode}
          requestedState={null}
          resetOnReplayDone
          originalCode={initialCode}
          availableFunctions={availFuncs}
          runScript={runScript}
          onReplayDone={onReplayDone}
          onScriptError={onScriptError}
          onStep={onEditorStep}
          onCancel={onScriptCancel}
          onStateChange={onEditorStateChange}
          showCodeLenCounter={false}
        />
      </Box>
      <MiniBoard
        state={boardState}
        // Only enable animations when the editor is running.
        enableAnimations={editorState === "running"}
        scale={1}
      />
    </Stack>
  );
}

RunnableExample.defaultProps = {
  level: SANDBOX_LEVEL,
};
