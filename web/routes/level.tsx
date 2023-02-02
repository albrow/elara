import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
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
import LevelEndModal from "../components/level/level_end_modal";
import Editor, { CodeError } from "../components/editor/editor";
import { saveCode, loadCode } from "../lib/file_system";
import { Replayer } from "../lib/replayer";
import ControlBar from "../components/control_bar";
import ObjectiveText from "../components/level/objective_text";
import { LEVELS } from "../lib/scenes";
import {
  markLevelCompleted,
  SaveData,
  updateLevelCode,
  useSaveData,
} from "../contexts/save_data";
import { getLevelEndProps } from "../lib/level_end_messages";
import DialogModal from "../components/dialog/dialog_modal";
import ShowDialogButton from "../components/level/show_dialog_button";
import { TREES } from "../lib/dialog_trees";

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
    [currLevel, saveData.levelStates]
  );

  // Note(albrow): Don't call unsafeSetCode directly, use forceUpdateCode instead.
  const [code, unsafeSetCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [boardState, setBoardState] = useState(currLevel().initial_state);
  const [activeLine, setActiveLine] = useState<LinePos | undefined>(undefined);
  const [codeError, setCodeError] = useState<CodeError | undefined>(undefined);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalKind, setModalKind] = useState<"success" | "failure">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const dialogTreeName = `level_${currLevel().short_name}`;

  const getDialogTree = useCallback(() => {
    if (!(dialogTreeName in TREES)) {
      // There is no dialog tree for this level.
      return null;
    }
    return dialogTreeName;
  }, [dialogTreeName]);

  const shouldShowDialogTree = useCallback(
    () =>
      getDialogTree() !== null &&
      !saveData.seenDialogTrees.includes(dialogTreeName),
    [dialogTreeName, getDialogTree, saveData.seenDialogTrees]
  );

  const [dialogVisible, setDialogVisible] = useState(shouldShowDialogTree());

  useEffect(() => {
    document.title = `Elara | Level ${levelNumber}: ${currLevel().name}`;
  }, [levelNumber, currLevel]);

  // Passed through to the Editor component to allow us
  // to get the current code from the editor in an efficient
  // way.
  const setGetCodeHandler = useCallback((handler: () => string) => {
    getCode = handler;
  }, []);

  const forceUpdateCode = useCallback(
    (newCode: string) => {
      // Note(albrow): Due to the fact that we don't
      // update `code` on every keystroke (for performance reasons),
      // React's view of the world might be outdated. That is,
      // the value of `code` might be different from the true underlying
      // value inside the CodeMirror editor.
      //
      // To workaround this, we need to first force React to re-render
      // the editor by first updating the current value of `code` to the
      // true underlying value (i.e., what is returned by `getCode`).
      if (code !== getCode()) {
        unsafeSetCode(getCode());
        // Then we use setTimeout to make React update the component on the
        // next tick.
        setTimeout(() => unsafeSetCode(newCode), 0);
      } else {
        // If we are already in sync, we don't need to use the workaround.
        unsafeSetCode(newCode);
      }
    },
    [code, unsafeSetCode]
  );

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
  const lastLocation = useRef(location.pathname);
  useEffect(() => {
    if (lastLocation.current !== location.pathname) {
      lastLocation.current = location.pathname;
      resetStateButKeepCode(currLevel());
      forceUpdateCode(initialCode());
      setDialogVisible(shouldShowDialogTree());
    }
  }, [
    location,
    currLevel,
    resetStateButKeepCode,
    initialCode,
    forceUpdateCode,
    getDialogTree,
    shouldShowDialogTree,
  ]);

  const onStepHandler = (step: FuzzyStateWithLine) => {
    setBoardState(step.state);
    if (step.line_pos) {
      setActiveLine(step.line_pos);
    } else {
      setActiveLine(undefined);
    }
  };

  // Called when the replay is done (i.e. the user has either completed or failed the
  // objective).
  const onReplayDoneHandler = useCallback(
    (result: RunResult, pendingSaveData: SaveData) => () => {
      const endResult = getLevelEndProps(result);

      // Show the modal.
      setModalKind(endResult.modalKind);
      setModalTitle(endResult.modalTitle);
      setModalMessage(endResult.modalMessage);
      setModalVisible(true);

      if (endResult.isCompleted) {
        // Update the level completed status.
        const newSaveData = markLevelCompleted(
          pendingSaveData,
          currLevel().short_name
        );
        setSaveData(newSaveData);
      }
    },
    [currLevel, setSaveData]
  );

  // When the run button is clicked, run the code and start the replay.
  const runHandler = useCallback(() => {
    const currCode = getCode();

    // Store the latest code in the save data.
    const newSaveData = updateLevelCode(
      saveData,
      currLevel().short_name,
      currCode
    );
    setSaveData(newSaveData);

    let result: RunResult;
    try {
      result = game.run_player_script(currCode, currLevel().short_name);
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

    // Reset the board state and start the replay.
    resetStateButKeepCode();
    setBoardState(result.states[0].state);
    setIsRunning(true);
    replayer = new Replayer(
      result.states,
      onStepHandler,
      onReplayDoneHandler(result, newSaveData)
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
    forceUpdateCode(loadedCode);
  }, [forceUpdateCode]);

  // Reset the code to its initial state for the current
  // level (regardless of what has been saved in the save
  // data).
  const resetCodeHandler = useCallback(() => {
    forceUpdateCode(currLevel().initial_code);
    const newSaveData = updateLevelCode(
      saveData,
      currLevel().short_name,
      currLevel().initial_code
    );
    setSaveData(newSaveData);
  }, [currLevel, saveData, setSaveData, forceUpdateCode]);

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
        runHandler();
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
      <DialogModal
        visible={dialogVisible}
        setVisible={setDialogVisible}
        treeName={getDialogTree()}
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
              resetCodeHandler={resetCodeHandler}
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
        {!dialogVisible && getDialogTree() !== null && (
          <Box mt="60px">
            <ShowDialogButton onClick={() => setDialogVisible(true)} />
          </Box>
        )}
      </Container>
    </>
  );
}
