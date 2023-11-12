import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Flex, Text, Box, Stack } from "@chakra-ui/react";
import { BsStar, BsStarFill } from "react-icons/bs";
import { MdCheckCircle, MdCheckCircleOutline } from "react-icons/md";
import { useRouter } from "react-router5";
import { Unsubscribe } from "router5/dist/types/base";

import { StateWithLines, Game, RunResult } from "../../elara-lib/pkg";
import Board from "../components/board/board";
import Editor, { EditorState } from "../components/editor/editor";
import ObjectiveText from "../components/level/objective_text";
import { useSaveData } from "../hooks/save_data_hooks";
import { TREES } from "../lib/dialog_trees";
import { useShortsModal } from "../hooks/shorts_modal_hooks";
import LevelSuccessModal from "../components/level/success_modal";
import { useCurrScene } from "../hooks/scenes_hooks";
import ChallengeText from "../components/level/challenge_text";
import { useErrorModal } from "../hooks/error_modal_hooks";
import ShowDialogButton from "../components/level/show_dialog_button";
import ShowHintButton from "../components/level/show_hint_button";
import { useHintsModal } from "../hooks/hints_modal_hooks";
import {
  BG_Z_INDEX,
  MONITOR_FRAME_Z_INDEX,
  NAVBAR_HEIGHT,
} from "../lib/constants";
import { useSoundManager } from "../hooks/sound_manager_hooks";
import { ErrorType } from "../contexts/error_modal";
import LevelTitle from "../components/level/level_title";
import { useDialogModal } from "../hooks/dialog_modal_hooks";
import MonitorStand from "../components/level/monitor_stand";

import monitorBgImage from "../images/monitor_bg_only.jpg";

const game = Game.new();

// How long to wait before playing the challenge sound effect.
const CHALLENGE_SOUND_DELAY_MS = 3400;

export default function Level() {
  const [
    saveData,
    { markLevelCompleted, markLevelChallengeCompleted, updateLevelCode },
  ] = useSaveData();
  const currScene = useCurrScene();
  const router = useRouter();

  // Note: unsafeSetEditorState should only be called in response to an onStateChange
  // event from the Editor component. It does not actually change the state inside the
  // Editor component. To do that, you have to use requestEditorState.
  const [editorState, unsafeSetEditorState] = useState<EditorState>("editing");
  // requestEditorState will request that the editor change its state to the given
  // state. It is not gauranteed that the Editor will respect this request, but if it
  // does, it will trigger an onStateChange event with the new state. For now "editing"
  // is the only type of state that parent components can request.
  const [requestedEditorState, requestEditorState] =
    useState<EditorState | null>(null);

  const [showErrorModal, _hideErrorModal, setErrorModalOnClose] =
    useErrorModal();
  const [showHintsModal] = useHintsModal();

  // Load sound effects.
  const { getSound } = useSoundManager();
  const successSound = useMemo(() => getSound("success"), [getSound]);
  const challengeSound = useMemo(() => getSound("challenge"), [getSound]);
  const stopMySoundEffects = useCallback(() => {
    successSound.stop();
    challengeSound.stop();
  }, [successSound, challengeSound]);

  const currLevel = useCallback(() => {
    if (!currScene || currScene.type !== "level" || !currScene.level) {
      throw new Error(`Could not get level for current scene: ${currScene}`);
    }
    return currScene.level!;
  }, [currScene]);

  const availFuncs = useMemo(() => {
    const funcs = new Set(saveData.unlockedFunctions);
    currLevel().disabled_funcs.forEach((funcName) => {
      funcs.delete(funcName);
    });
    return [...funcs];
  }, [currLevel, saveData.unlockedFunctions]);

  // Update the page title whenever the level changes.
  useEffect(() => {
    if (!currScene) {
      return;
    }
    document.title = `Elara | Level ${currScene.levelIndex}: ${
      currLevel().name
    }`;
  }, [currLevel, currScene]);

  const initialCode = useCallback(
    () =>
      saveData.levelStates[currLevel().short_name]?.code ||
      currLevel().initial_code,
    [currLevel, saveData.levelStates]
  );

  const levelName = useRef<string>(currLevel().name);
  const [boardState, setBoardState] = useState(currLevel().initial_state);
  useEffect(() => {
    if (levelName.current !== currLevel().name) {
      // The level has changed, so reset the board state.
      levelName.current = currLevel().name;
      setBoardState(currLevel().initial_state);
    }
  }, [currLevel]);

  const [showShortsModal, hideShortsModal] = useShortsModal();
  useEffect(() => {
    // Update the shorts modal state whenever the route changes.
    if (currScene?.tutorialShorts) {
      // Note this may be overriden by the ShortsModalContext if the user
      // has already seen these particular tutorials.
      showShortsModal(currScene.tutorialShorts);
    }
    return () => {
      // Hide the shorts modal when the route changes.
      hideShortsModal();
    };
  }, [currScene?.tutorialShorts, hideShortsModal, showShortsModal]);

  const [modalVisible, setModalVisible] = useState(false);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);

  const [showDialogModal] = useDialogModal();

  const getDialogTree = useCallback(() => {
    const dialogTreeName = `level_${currLevel().short_name}`;
    if (!(dialogTreeName in TREES)) {
      // There is no dialog tree for this level.
      return null;
    }
    return dialogTreeName;
  }, [currLevel]);

  const shouldShowDialogTree = useCallback(() => {
    const dialogTreeName = `level_${currLevel().short_name}`;
    return (
      getDialogTree() !== null &&
      !saveData.seenDialogTrees.includes(dialogTreeName)
    );
  }, [currLevel, getDialogTree, saveData.seenDialogTrees]);

  useEffect(() => {
    // Update the dialog state whenever the level changes.
    if (shouldShowDialogTree() && getDialogTree() !== null) {
      // Show the dialog modal.
      showDialogModal(getDialogTree()!);
    }
  }, [getDialogTree, shouldShowDialogTree, showDialogModal]);

  // Track the challenge sound timeout and cancel it if this component unmounts or route
  // changes.
  const challengeSoundTimeout = useRef<number | null>(null);
  useEffect(() => {
    const unsubscribe = router.subscribe((_transition) => {
      if (challengeSoundTimeout.current !== null) {
        clearTimeout(challengeSoundTimeout.current);
      }
    }) as Unsubscribe;
    return unsubscribe;
  }, [router]);

  const resetLevelState = useCallback(() => {
    setModalVisible(false);
    setBoardState(currLevel().initial_state);
    requestEditorState("editing");
    stopMySoundEffects();
    if (challengeSoundTimeout.current !== null) {
      clearTimeout(challengeSoundTimeout.current);
    }
  }, [currLevel, stopMySoundEffects]);

  // Returns a function that can be used to run a script.
  // Passed through to the editor, which doesn't know about the game object or
  // the current level.
  const runScript = useCallback(
    (script: string) => {
      // Store the latest code in the save data.
      updateLevelCode(currLevel().short_name, script);

      // Then run the script using the current level name.
      return game.run_player_script(currLevel().short_name, availFuncs, script);
    },
    [availFuncs, currLevel, updateLevelCode]
  );

  const onEditorStep = useCallback((step: StateWithLines) => {
    setBoardState(step.state);
  }, []);

  const onEditorStateChange = useCallback((state: EditorState) => {
    // If there is a pending requested editor state, change it to null.
    // This is telling the editor we are no longer requesting any specific
    // state.
    requestEditorState(null);
    // Then update our (i.e. the Level component's) reckoning of the editor state.
    unsafeSetEditorState(state);
  }, []);

  // Called when the replay is done (i.e. the user has either completed or failed the
  // objective).
  const onReplayDone = useCallback(
    (script: string, result: RunResult) => {
      // Store the latest code in the save data.
      updateLevelCode(currLevel().short_name, script);
      if (result.outcome === "success") {
        // Show the success modal.
        setModalVisible(true);
        setLastResult(result);
        successSound.play();

        // Update the level status in local storage.
        markLevelCompleted(currLevel().short_name);
        if (result.passes_challenge) {
          markLevelChallengeCompleted(currLevel().short_name);
          // If we passed the challenge, start a timer to play the special
          // challenge sound effect. This delay lets it line up with the
          // animations.
          challengeSoundTimeout.current = window.setTimeout(() => {
            challengeSound.play();
          }, CHALLENGE_SOUND_DELAY_MS);
        }
      } else {
        // Show the failure modal.
        const modalKind = result.outcome === "continue" ? "continue" : "error";
        const modalError =
          result.outcome === "continue" ? undefined : result.outcome;
        const modalErrType = result.err_type as ErrorType;
        setErrorModalOnClose(resetLevelState);
        showErrorModal(modalKind, modalError, modalErrType);
      }
    },
    [
      challengeSound,
      currLevel,
      markLevelChallengeCompleted,
      markLevelCompleted,
      resetLevelState,
      setErrorModalOnClose,
      showErrorModal,
      successSound,
      updateLevelCode,
    ]
  );

  const persistCode = useCallback(
    (script: string) => {
      updateLevelCode(currLevel().short_name, script);
    },
    [currLevel, updateLevelCode]
  );

  const onScriptError = useCallback(
    (_script: string, error: Error) => {
      setErrorModalOnClose(resetLevelState);
      showErrorModal("error", error.message);
    },
    [resetLevelState, setErrorModalOnClose, showErrorModal]
  );

  const onScriptCancel = useCallback(() => {
    resetLevelState();
  }, [resetLevelState]);

  const getObjectiveIcon = useCallback(() => {
    if (currScene !== null && currScene.completed) {
      return (
        <MdCheckCircle
          size="1.1em"
          color="var(--chakra-colors-green-400)"
          style={{
            marginRight: "0.2rem",
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      );
    }
    return (
      <MdCheckCircleOutline
        size="1.1em"
        color="var(--chakra-colors-gray-400)"
        style={{
          marginRight: "0.2rem",
          display: "inline",
          verticalAlign: "middle",
        }}
      />
    );
  }, [currScene]);

  const getChallengeIcon = useCallback(() => {
    if (currScene !== null && currScene.challengeCompleted) {
      return (
        <BsStarFill
          size="1.1em"
          color="var(--chakra-colors-yellow-400)"
          style={{
            marginRight: "0.2rem",
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      );
    }
    return (
      <BsStar
        size="1.1em"
        color="var(--chakra-colors-gray-400)"
        style={{
          marginRight: "0.2rem",
          display: "inline",
          verticalAlign: "middle",
        }}
      />
    );
  }, [currScene]);

  const monitorFrame = useRef<HTMLDivElement>(null);

  return (
    <>
      <LevelSuccessModal
        result={lastResult}
        visible={modalVisible}
        setVisible={setModalVisible}
        onClose={resetLevelState}
      />
      {/* Monitor background image */}
      <Box
        position="fixed"
        w="100%"
        h="100%"
        zIndex={BG_Z_INDEX}
        bgImage={monitorBgImage}
        bgRepeat="no-repeat"
        bgSize="cover"
        bgPosition="bottom"
        pt={`${NAVBAR_HEIGHT}px`}
        overflowX="auto"
      />
      <MonitorStand monitorFrameRef={monitorFrame} />
      <Box
        position="fixed"
        w="100%"
        h="100%"
        zIndex={MONITOR_FRAME_Z_INDEX}
        pt={`${NAVBAR_HEIGHT}px`}
        overflow="auto"
      >
        <Flex h="100%">
          {/* Monitor Frame */}
          <Box
            ref={monitorFrame}
            h="fit-content"
            bg="white"
            mx="auto"
            my="auto"
            w={{ base: "1080px", xl: "fit-content" }}
            px={{ base: "10px", "2xl": "24px" }}
            pt={{ base: "18px", "2xl": "24px" }}
            pb={{ lg: "0px", "2xl": "12px" }}
            border="3px solid"
            borderColor="gray.500"
            boxShadow="0 0 20px 2px rgba(255, 255, 255, 0.5)"
          >
            {/* Level name and upper UI elements */}
            <Box>
              <Flex>
                <LevelTitle
                  title={currLevel().name}
                  levelIndex={currScene?.levelIndex || 0}
                />
                {currScene?.hints != null && currScene?.hints.length > 0 && (
                  <Box ml="8px" my="auto" mt="3px">
                    <ShowHintButton onClick={showHintsModal} />
                  </Box>
                )}
                {getDialogTree() !== null && (
                  <Box ml="12px" my="auto" mt="3px">
                    <ShowDialogButton
                      onClick={() => showDialogModal(getDialogTree()!)}
                    />
                  </Box>
                )}
              </Flex>
            </Box>
            {/* Objective/challenge text */}
            <Box>
              <Text as="span" verticalAlign="middle">
                {getObjectiveIcon()}
                <Text as="span" verticalAlign="middle" fontWeight="bold">
                  Objective:
                </Text>{" "}
                <ObjectiveText text={currLevel().objective} />
              </Text>
              {currLevel().challenge !== "" && currScene?.completed && (
                <Text as="span" ml="0.5em" verticalAlign="middle">
                  {getChallengeIcon()}
                  <Text as="span" verticalAlign="middle" fontWeight="bold">
                    Challenge:
                  </Text>{" "}
                  <ChallengeText text={currLevel().challenge} />
                </Text>
              )}
            </Box>
            {/* Editor and board */}
            <Stack
              direction="row"
              mt="16px"
              h={{ base: "350px", xl: "fit-content" }}
            >
              <Box id="editor-section" mr={0}>
                <Box w={{ base: "584px", xl: "608px" }}>
                  <Editor
                    type="level"
                    requestedState={requestedEditorState}
                    code={initialCode()}
                    originalCode={currLevel().initial_code}
                    availableFunctions={availFuncs}
                    disabledFunctions={currLevel().disabled_funcs}
                    runScript={runScript}
                    onReplayDone={onReplayDone}
                    onScriptError={onScriptError}
                    onStep={onEditorStep}
                    onCancel={onScriptCancel}
                    persistCode={persistCode}
                    onStateChange={onEditorStateChange}
                  />
                </Box>
              </Box>
              <Box
                id="board-wrapper"
                transformOrigin="top left"
                height="fit-content"
                transform={{
                  base: "scale(0.75)",
                  xl: "none",
                }}
              >
                <Box
                  position="relative"
                  id="board-inner-wrapper"
                  overflow="hidden"
                  w="100%"
                  h="100%"
                >
                  <Board
                    gameState={boardState}
                    // Note: We only want to enable animations if the editor is in the "running" state.
                    // If the editor is in the "paused" state, it's more clear to move the sprites in
                    // discrete steps.
                    enableAnimations={editorState === "running"}
                    enableHoverInfo={editorState !== "running"}
                    showInitialState={editorState === "editing"}
                    asteroidWarnings={currLevel().asteroid_warnings}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
        </Flex>
      </Box>
    </>
  );
}
