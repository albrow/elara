import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { Container, Flex, Text, Box } from "@chakra-ui/react";

import {
  FuzzyStateWithLine,
  Game,
  LevelData,
  RunResult,
  ScriptStats,
} from "../../elara-lib/pkg";
import Board from "../components/board/board";
import Editor from "../components/editor/editor";
import ObjectiveText from "../components/level/objective_text";
import { getLevelIndexFromScene, getSceneFromRoute } from "../lib/scenes";
import {
  markLevelCompleted,
  updateLevelCode,
  useSaveData,
} from "../contexts/save_data";
import DialogModal from "../components/dialog/dialog_modal";
import ShowDialogButton from "../components/level/show_dialog_button";
import { TREES } from "../lib/dialog_trees";
import { useShortsModal } from "../contexts/shorts_modal";
import LevelEndModal from "../components/level/level_end_modal";
import { getLevelEndProps } from "../lib/level_end_messages";

const game = Game.new();

export default function Level() {
  const location = useLocation();
  const [saveData, setSaveData] = useSaveData();

  const currScene = getSceneFromRoute(location.pathname);
  if (!currScene || !currScene.level) {
    throw new Error("cannot determine level");
  }
  const currLevel = useCallback(() => currScene.level!, [currScene]);
  const levelIndex = getLevelIndexFromScene(currScene);

  const initialCode = useCallback(
    () =>
      saveData.levelStates[currLevel().short_name]?.code ||
      currLevel().initial_code,
    [currLevel, saveData.levelStates]
  );

  const [boardState, setBoardState] = useState(currLevel().initial_state);

  const [showShortsModal, _] = useShortsModal();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalKind, setModalKind] = useState<"success" | "failure">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalStats, setModalStats] = useState<ScriptStats | undefined>();
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
    document.title = `Elara | Level ${levelIndex}: ${currLevel().name}`;
  }, [levelIndex, currLevel]);

  const resetLevelState = useCallback(
    (levelOverride?: LevelData) => {
      const levelToLoad = levelOverride || currLevel();
      setModalVisible(false);
      setBoardState(levelToLoad.initial_state);
    },
    [currLevel]
  );

  // Reset the relevant state when the URL changes.
  const lastLocation = useRef(location.pathname);
  useEffect(() => {
    if (lastLocation.current !== location.pathname) {
      lastLocation.current = location.pathname;
      resetLevelState(currLevel());
      setDialogVisible(shouldShowDialogTree());
    }
  }, [currLevel, location, resetLevelState, shouldShowDialogTree]);

  useEffect(() => {
    // Check if we need to show tutorial shorts modal.
    const scene = getSceneFromRoute(location.pathname);
    if (scene?.tutorialShorts) {
      // Note this may be overriden by the ShortsModalContext if the user
      // has already seen these particular tutorials.
      showShortsModal(scene.tutorialShorts);
    }
  }, [location, showShortsModal]);

  // Returns a function that can be used to run a script.
  // Passed through to the editor, which doesn't know about the game object or
  // the current level.
  const runScript = useCallback(
    (script: string) => {
      // Store the latest code in the save data.
      const newSaveData = updateLevelCode(
        saveData,
        currLevel().short_name,
        script
      );
      setSaveData(newSaveData);

      // Then run the script using the current level name.
      return game.run_player_script(script, currLevel().short_name);
    },
    [currLevel, saveData, setSaveData]
  );

  const onEditorStep = useCallback((step: FuzzyStateWithLine) => {
    setBoardState(step.state);
  }, []);

  // Called when the replay is done (i.e. the user has either completed or failed the
  // objective).
  const onReplayDone = useCallback(
    (script: string, result: RunResult) => {
      const endResult = getLevelEndProps(result);

      // Show the modal.
      setModalKind(endResult.modalKind);
      setModalTitle(endResult.modalTitle);
      setModalMessage(endResult.modalMessage);
      setModalStats(result.stats);
      setModalVisible(true);

      // Store the latest code in the save data.
      // We need to do this again to prevent race conditions.
      let pendingSaveData = updateLevelCode(
        saveData,
        currLevel().short_name,
        script
      );
      if (endResult.isCompleted) {
        // Update the level completed status.
        pendingSaveData = markLevelCompleted(
          pendingSaveData,
          currLevel().short_name
        );
      }
      setSaveData(pendingSaveData);
    },
    [currLevel, saveData, setSaveData]
  );

  const onScriptError = useCallback((script: string, error: Error) => {
    setModalKind("failure");
    setModalTitle("Uh Oh!");
    setModalMessage(error.message);
    setModalVisible(true);
  }, []);

  const onScriptCancel = useCallback(() => {
    resetLevelState();
  }, [resetLevelState]);

  return (
    <>
      <LevelEndModal
        visible={modalVisible}
        setVisible={setModalVisible}
        title={modalTitle}
        message={modalMessage}
        kind={modalKind}
        stats={modalStats}
        onClose={resetLevelState}
      />
      <DialogModal
        visible={dialogVisible}
        setVisible={setDialogVisible}
        treeName={getDialogTree()}
      />
      <Container maxW="container.xl" mt={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={1}>
            Level {levelIndex}: {currLevel().name}
          </Text>
          <p>
            <b>Objective:</b> <ObjectiveText text={currLevel().objective} />
          </p>
        </Box>
        <Flex direction="row" mt={4}>
          <Box id="editor-section" mr={2} flexGrow={1}>
            <Box w="608px">
              <Editor
                type="level"
                code={initialCode()}
                originalCode={currLevel().initial_code}
                availableFunctions={currLevel().available_functions}
                runScript={runScript}
                onReplayDone={onReplayDone}
                onScriptError={onScriptError}
                onStep={onEditorStep}
                onCancel={onScriptCancel}
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
