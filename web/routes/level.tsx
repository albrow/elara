import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Container, Flex, Text, Box } from "@chakra-ui/react";

import {
  Game,
  LevelData,
  RhaiError,
  RunResult,
  FuzzyStateWithLine,
  LinePos,
} from "../../elara-lib/pkg";
import Board from "../components/board/board";
import LevelEndModal from "../components/level_end_modal";
import Editor, { CodeError } from "../components/editor/editor";
import { saveCode, loadCode } from "../lib/storage";
import { Replayer } from "../lib/replayer";
import ControlBar from "../components/control_bar";
import ObjectiveText from "../components/objective_text";
import { LEVELS } from "../lib/scenes";
import {
  updateLevelCode,
  useSaveData,
  markLevelCompleted,
} from "../lib/save_data";

const game = Game.new();
let replayer: Replayer | null = null;

// A handler used to get the current code from the editor.
// Starts out unset, but will be set by the editor component.
let getCode: () => string;

export default function Level() {
  const { levelNumber } = useParams();
  const currLevel = useCallback(() => {
    if (!levelNumber) {
      throw new Error("levelNumber is required");
    }
    const levelIndex = parseInt(levelNumber, 10);
    const level = LEVELS[levelIndex];
    if (!level) {
      throw new Error(`Level ${levelIndex} not found`);
    }
    return level;
  }, [levelNumber]);

  const [saveData, setSaveData] = useSaveData();

  const initialCode = useCallback(
    () =>
      saveData.levelStates[currLevel().short_name]?.code ||
      currLevel().initial_code,
    [currLevel, saveData]
  );

  const [code, setCode] = useState(initialCode());
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [boardState, setBoardState] = useState(currLevel().initial_state);
  const [activeLine, setActiveLine] = useState<LinePos | undefined>(undefined);
  const [codeError, setCodeError] = useState<CodeError | undefined>(undefined);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalKind, setModalKind] = useState<"success" | "failure">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    document.title = `Elara | Level ${levelNumber}: ${currLevel().name}`;
  }, [levelNumber, currLevel]);

  // Passed through to the Editor component to allow us
  // to get the current code from the editor in an efficient
  // way.
  const setGetCodeHandler = useCallback((handler: () => string) => {
    getCode = handler;
  }, []);

  const resetStateButKeepCode = useCallback(
    (levelOverride?: LevelData) => {
      const levelToLoad = levelOverride || currLevel();
      setModalVisible(false);
      setIsRunning(false);
      setIsPaused(false);
      if (replayer) {
        replayer.stop();
      }
      setActiveLine(undefined);
      setCodeError(undefined);
      setBoardState(levelToLoad.initial_state);
    },
    [currLevel]
  );

  // Reset the relevant state when the URL changes.
  const location = useLocation();
  useEffect(() => {
    resetStateButKeepCode(currLevel());
    setCode(initialCode());
  }, [location, currLevel, resetStateButKeepCode, initialCode]);

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
          // Set modal parameters and show the modal.
          setModalKind("success");
          setModalTitle("Great Job!");
          setModalMessage(
            "Great! Keep playing around with the code as much as you like! Whenever you are " +
              "ready, you can move on to the next level."
          );
          setModalVisible(true);

          // Update the level completed status.
          // eslint-disable-next-line no-case-declarations
          let newSaveData = markLevelCompleted(
            saveData,
            currLevel().short_name
          );
          setSaveData(newSaveData);

          break;
        case "success":
          setModalKind("success");
          setModalTitle("Great Job!");
          setModalMessage(
            "You completed the objective! You can replay this level if you want or move on to the next one."
          );
          setModalVisible(true);

          // Update the level completed status.
          // eslint-disable-next-line no-case-declarations
          newSaveData = markLevelCompleted(saveData, currLevel().short_name);
          setSaveData(newSaveData);

          break;
        case "continue":
          setModalKind("failure");
          setModalTitle("Keep Going!");
          setModalMessage(
            "You didn't quite complete the objective, but you're on the right track!"
          );
          setModalVisible(true);
          break;
        default:
          setModalKind("failure");
          setModalTitle("Uh Oh!");
          setModalMessage(result.outcome);
          setModalVisible(true);
          break;
      }
    },
    [currLevel, saveData, setSaveData]
  );

  // When the run button is clicked, run the code and start the replay.
  const runHandler = useCallback(async () => {
    // Store the latest code in the save data.
    const newSaveData = updateLevelCode(
      saveData,
      currLevel().short_name,
      getCode()
    );
    setSaveData(newSaveData);

    let result: RunResult;
    try {
      result = await game.run_player_script(getCode(), currLevel().short_name);
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
          setModalKind("failure");
          setModalTitle("Uh Oh!");
          setModalMessage(e.message);
          setModalVisible(true);
        }
        return;
      }
      throw e;
    }
    resetStateButKeepCode();
    setBoardState(result.states[0].state);
    setIsRunning(true);
    replayer = new Replayer(
      result.states,
      onStepHandler,
      onReplayDoneHandler(result)
    );
    replayer.start();
  }, [
    saveData,
    currLevel,
    setSaveData,
    resetStateButKeepCode,
    onReplayDoneHandler,
  ]);

  const stopHandler = useCallback(() => {
    resetStateButKeepCode();
  }, [resetStateButKeepCode]);

  const pauseHandler = useCallback(() => {
    if (replayer) {
      replayer.pause();
      setIsPaused(true);
    }
  }, []);

  const stepForwardHandler = useCallback(() => {
    if (replayer) {
      replayer.stepForward();
    }
  }, []);

  const stepBackHandler = useCallback(() => {
    if (replayer) {
      replayer.stepBackward();
    }
  }, []);

  const resumeHandler = useCallback(() => {
    if (replayer) {
      replayer.start();
      setIsPaused(false);
    }
  }, []);

  const saveCodeHandler = useCallback(async () => {
    await saveCode(getCode());
  }, []);

  const loadCodeHandler = useCallback(async () => {
    const loadedCode = await loadCode();
    setCode(loadedCode);
  }, []);

  useEffect(() => {
    const keyListener = async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        // Save on Ctrl + S or Cmd + S
        await saveCodeHandler();
        event.preventDefault();
        return false;
      }
      // Run the script on Shift + Enter
      if (event.shiftKey && event.key === "Enter" && !isRunning) {
        await runHandler();
        event.preventDefault();
        return false;
      }
      // Stop running the script on Escape.
      if (event.key === "Escape" && isRunning) {
        stopHandler();
        event.preventDefault();
        return false;
      }
      return Promise.resolve();
    };
    document.addEventListener("keydown", keyListener);
    return () => {
      document.removeEventListener("keydown", keyListener);
    };
  }, [isRunning, runHandler, saveCodeHandler, stopHandler]);

  return (
    <>
      <LevelEndModal
        visible={modalVisible}
        setVisible={setModalVisible}
        title={modalTitle}
        message={modalMessage}
        kind={modalKind}
        onClose={resetStateButKeepCode}
      />
      <Container maxW="container.xl" mt={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={1}>
            Level {levelNumber}: {currLevel().name}
          </Text>
          <p>
            <b>Objective:</b> <ObjectiveText text={currLevel().objective} />
          </p>
        </Box>
        <Flex direction="row" mt={4}>
          <Box id="editor-section" mr={2} flexGrow={1}>
            <ControlBar
              isRunning={isRunning}
              isPaused={isPaused}
              runHandler={runHandler}
              stopHandler={stopHandler}
              pauseHandler={pauseHandler}
              stepForwardHandler={stepForwardHandler}
              stepBackHandler={stepBackHandler}
              resumeHandler={resumeHandler}
              saveCodeHandler={saveCodeHandler}
              loadCodeHandler={loadCodeHandler}
            />
            <Box w="608px">
              <Editor
                code={code}
                type="level"
                editable={!isRunning}
                setGetCodeHandler={setGetCodeHandler}
                activeLine={activeLine}
                codeError={codeError}
              />
            </Box>
          </Box>
          <Box id="board-wrapper" position="relative">
            <Board gameState={boardState} />
          </Box>
        </Flex>
      </Container>
    </>
  );
}
