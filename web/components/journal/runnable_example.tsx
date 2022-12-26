import { Box, Flex } from "@chakra-ui/react";
import { useState, useCallback, useRef } from "react";

import { LEVELS } from "../../lib/scenes";
import { Offset } from "../../lib/utils";
import Editor, { CodeError } from "../editor/editor";
import ControlBar from "../control_bar";
import Player from "../board/player";
import { Replayer } from "../../lib/replayer";
import {
  Game,
  FuzzyStateWithLine,
  LinePos,
  RunResult,
  RhaiError,
  // eslint-disable-next-line camelcase
  new_pos,
} from "../../../elara-lib/pkg/elara_lib";

export interface RunnableExampleProps {
  code: string;
}

export default function RunnableExample(props: RunnableExampleProps) {
  const fixedPlayerOffset: Offset = {
    pos: new_pos(),
    top: "0px",
    left: "0px",
  };

  const game = Game.new();
  const initialState = LEVELS[0].initial_state;

  // A handler used to get the current code from the editor.
  // Starts out unset, but will be set by the editor component.
  const getCode = useRef(() => props.code);
  const [replayer, setReplayer] = useState<Replayer | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [boardState, setBoardState] = useState(initialState);
  const [activeLine, setActiveLine] = useState<LinePos | undefined>(undefined);
  const [codeError, setCodeError] = useState<CodeError | undefined>(undefined);

  // Passed through to the Editor component to allow us
  // to get the current code from the editor in an efficient
  // way.
  const setGetCodeHandler = useCallback((handler: () => string) => {
    getCode.current = handler;
  }, []);

  const resetStateButKeepCode = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (replayer) {
      replayer.stop();
    }
    setActiveLine(undefined);
    setCodeError(undefined);
    setBoardState(initialState);
  }, [initialState, replayer]);

  const onStepHandler = (step: FuzzyStateWithLine) => {
    setBoardState(step.state);
    if (step.line_pos) {
      setActiveLine(step.line_pos);
    } else {
      setActiveLine(undefined);
    }
  };

  const onReplayDoneHandler = useCallback(
    (result: RunResult) => () => {
      // There are no more steps to iterate through, display the outcome.
      switch (result.outcome) {
        case "no_objective":
          break;
        case "success":
          break;
        case "continue":
          break;
        default:
          alert(result.outcome);
          break;
      }
      resetStateButKeepCode();
    },
    [resetStateButKeepCode]
  );

  // When the run button is clicked, run the code and start the replay.
  const runHandler = useCallback(async () => {
    let result: RunResult;
    try {
      result = await game.run_player_script(getCode.current(), "hello_world");
    } catch (e) {
      // If there is an error, display it in the editor.
      if (e instanceof RhaiError) {
        console.warn(`Rhai Error detected: ${e.message}`);
        if (e.line) {
          setCodeError({
            line: e.line,
            col: e.col,
            message: e.message,
          });
        } else {
          alert(e.message);
        }

        return;
      }
      throw e;
    }
    resetStateButKeepCode();
    setBoardState(result.states[0].state);
    setIsRunning(true);
    const newReplayer = new Replayer(
      result.states,
      onStepHandler,
      onReplayDoneHandler(result)
    );
    setReplayer(newReplayer);
    newReplayer.start();
  }, [resetStateButKeepCode, onReplayDoneHandler, game, getCode]);

  const stopHandler = useCallback(() => {
    resetStateButKeepCode();
  }, [resetStateButKeepCode]);

  const pauseHandler = useCallback(() => {
    if (replayer) {
      replayer.pause();
      setIsPaused(true);
    }
  }, [replayer]);

  const stepForwardHandler = useCallback(() => {
    if (replayer) {
      replayer.stepForward();
    }
  }, [replayer]);

  const stepBackHandler = useCallback(() => {
    if (replayer) {
      replayer.stepBackward();
    }
  }, [replayer]);

  const resumeHandler = useCallback(() => {
    if (replayer) {
      replayer.start();
      setIsPaused(false);
    }
  }, [replayer]);

  return (
    <Flex width="100%" direction="row" mb="50px" mt="25px">
      <Box flex="1.0 1.0">
        <ControlBar
          isRunning={isRunning}
          isPaused={isPaused}
          runHandler={runHandler}
          stopHandler={stopHandler}
          pauseHandler={pauseHandler}
          stepForwardHandler={stepForwardHandler}
          stepBackHandler={stepBackHandler}
          resumeHandler={resumeHandler}
        />
        <Box>
          <Editor
            code={props.code}
            editable
            setGetCodeHandler={setGetCodeHandler}
            type="example"
            activeLine={activeLine}
            codeError={codeError}
          />
        </Box>
      </Box>
      <Box
        id="fake-board"
        minH="80px"
        width={410}
        p={4}
        ml={3}
        bg="gray.300"
        border="1px"
        borderColor="gray.800"
      >
        <Box position="relative">
          <Player
            offset={fixedPlayerOffset}
            fuel={10}
            fuzzy={false}
            message={boardState.players[0].message}
          />
        </Box>
      </Box>
    </Flex>
  );
}
