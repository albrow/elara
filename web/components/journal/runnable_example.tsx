import { Box, Stack } from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { SANDBOX_LEVEL } from "../../contexts/scenes";
import Editor, { EditorState } from "../editor/editor";
import {
  Game,
  FuzzyStateWithLines,
  RunResult,
  LevelData,
} from "../../../elara-lib/pkg/elara_lib";
import { useErrorModal } from "../../contexts/error_modal";
import MiniBoard from "./mini_board";

export interface RunnableExampleProps {
  code: string;
  level?: LevelData;
}

export default function RunnableExample(props: RunnableExampleProps) {
  const game = Game.new();
  const initialState = props.level!.initial_state;
  const [editorState, setEditorState] = useState<EditorState>("editing");
  const [showErrorModal] = useErrorModal();

  // If the initial code is short, add some extra lines
  // to make the editor look better.
  let initialCode = props.code;
  while (initialCode.split("\n").length < 4) {
    initialCode += "\n";
  }
  const [boardState, setBoardState] = useState(initialState);

  const resetState = useCallback(() => {
    setBoardState(initialState);
  }, [initialState]);

  const runScript = useCallback(
    (script: string) => game.run_player_script(script, props.level!.short_name),
    [game, props.level]
  );

  const onReplayDone = useCallback(
    (_script: string, result: RunResult) => {
      if (!["success", "continue", "no_objective"].includes(result.outcome)) {
        showErrorModal("error", result.outcome);
      }
      resetState();
    },
    [resetState, showErrorModal]
  );

  const onEditorStep = useCallback((step: FuzzyStateWithLines) => {
    setBoardState(step.state);
  }, []);

  const onEditorStateChange = useCallback((state: EditorState) => {
    setEditorState(state);
  }, []);

  const onScriptError = useCallback(
    (_script: string, error: Error) => {
      // TDOO(albrow): Use a modal component instead of an alert window.
      showErrorModal("error", error.message);
    },
    [showErrorModal]
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
      <Box width="608px">
        <Editor
          type="example"
          code={initialCode}
          originalCode={initialCode}
          availableFunctions={SANDBOX_LEVEL.available_functions}
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
      />
    </Stack>
  );
}

RunnableExample.defaultProps = {
  level: SANDBOX_LEVEL,
};
