import { Box, Stack } from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { SANDBOX_LEVEL } from "../../lib/scenes";
import Editor from "../editor/editor";
import {
  Game,
  FuzzyStateWithLine,
  RunResult,
} from "../../../elara-lib/pkg/elara_lib";
import MiniBoard from "./mini_board";

export interface RunnableExampleProps {
  code: string;
}

export default function RunnableExample(props: RunnableExampleProps) {
  const game = Game.new();
  const initialState = SANDBOX_LEVEL.initial_state;

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

  // Note: For runnable examples, we always use the special "sandbox" level.
  const runScript = useCallback(
    (script: string) =>
      game.run_player_script(script, SANDBOX_LEVEL.short_name),
    [game]
  );

  const onReplayDone = useCallback(
    (script: string, result: RunResult) => {
      if (!["success", "continue", "no_objective"].includes(result.outcome)) {
        // TDOO(albrow): Use a modal component instead of an alert window.
        alert(result.outcome);
      }
      resetState();
    },
    [resetState]
  );

  const onEditorStep = (step: FuzzyStateWithLine) => {
    setBoardState(step.state);
  };

  const onScriptError = useCallback((script: string, error: Error) => {
    // TDOO(albrow): Use a modal component instead of an alert window.
    alert(error.message);
  }, []);

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
        />
      </Box>
      <MiniBoard state={boardState} />
    </Stack>
  );
}
