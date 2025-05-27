import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Flex, Box, Stack } from "@chakra-ui/react";
import { useRouter } from "react-router5";
import { Unsubscribe } from "router5/dist/types/base";

import { useWindowSize } from "@uidotdev/usehooks";
import { StateWithLines, Game, RunResult } from "../../elara-lib/pkg";
import Board from "../components/board/board";
import Editor, { EditorState } from "../components/editor/editor";
import { useSaveData } from "../hooks/save_data_hooks";
import { TREES } from "../lib/dialog_trees";
import { useShortsModal } from "../hooks/shorts_modal_hooks";
import LevelSuccessModal from "../components/level/success_modal";
import { useCurrScene } from "../hooks/scenes_hooks";
import { useErrorModal } from "../hooks/error_modal_hooks";
import { BG_Z_INDEX, MONITOR_FRAME_Z_INDEX } from "../lib/constants";
import {
  BP_LG,
  BP_XL,
  EDITOR_SECTION_RESPONSIVE_WIDTH,
  LEVEL_TOTAL_TOP_RESPONSIVE_HEIGHT,
  MONITOR_BORDER_WIDTH,
  MONITOR_PADDING_2XL,
  MONITOR_PADDING_BASE,
  NAVBAR_RESPONSIVE_HEIGHT,
} from "../lib/responsive_design";
import { useSoundManager } from "../hooks/sound_manager_hooks";
import { ErrorType } from "../contexts/error_modal";
import { useDialogModal } from "../hooks/dialog_modal_hooks";
import MonitorStand from "../components/level/monitor_stand";

import monitorBgImage from "../images/monitor_bg_only.jpg";
import LevelTopBar from "../components/level/level_top_bar";

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

  // We need to know the window size to control the scale of the board. This also
  // affects position of board elements.
  const windowSize = useWindowSize();
  const boardScale = useMemo(() => {
    const { width } = windowSize;
    if (width == null) {
      return 1;
    }
    if (width < BP_LG) {
      return 0.75;
    }
    if (width < BP_XL) {
      return 0.8;
    }

    return 1;
  }, [windowSize]);

  // Note: unsafeSetEditorState should only be called in response to an onStateChange
  // event from the Editor component. It does not actually change the state inside the
  // Editor component. To do that, you have to use requestEditorState.
  const [editorState, unsafeSetEditorState] = useState<EditorState>("editing");
  // requestEditorState will request that the editor change its state to the given
  // state. It is not guaranteed that the Editor will respect this request, but if it
  // does, it will trigger an onStateChange event with the new state. For now "editing"
  // is the only type of state that parent components can request.
  const [requestedEditorState, requestEditorState] =
    useState<EditorState | null>(null);

  const [showErrorModal, _hideErrorModal, setErrorModalOnClose] =
    useErrorModal();

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
    document.title = `Elara | Level ${currScene.levelIndex}: ${currLevel().name
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
      // Note this may be overridden by the ShortsModalContext if the user
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
        bgImage={`url("${monitorBgImage}")`}
        bgRepeat="no-repeat"
        bgSize="cover"
        bgPosition="bottom"
        pt={NAVBAR_RESPONSIVE_HEIGHT}
        overflowX="auto"
      />
      <MonitorStand monitorFrameRef={monitorFrame} />
      <LevelTopBar
        currScene={currScene}
        currLevel={currLevel()}
        dialogTreeName={getDialogTree()}
      />
      <Box
        position="fixed"
        w="100%"
        h="100%"
        zIndex={MONITOR_FRAME_Z_INDEX}
        pt={LEVEL_TOTAL_TOP_RESPONSIVE_HEIGHT}
        overflow="auto"
      >
        <Flex h="100%">
          {/* Monitor Frame */}
          <Box
            ref={monitorFrame}
            h="fit-content"
            w="fit-content"
            mx="auto"
            my="auto"
            py="0px"
            p={{
              base: `${MONITOR_PADDING_BASE}px`,
              "2xl": `${MONITOR_PADDING_2XL}px`,
            }}
            bg="rgba(255, 255, 255, 0.3)"
            border={`${MONITOR_BORDER_WIDTH}px solid`}
            borderColor="rgba(255, 255, 255, 0.3)"
            boxShadow="0 0 20px 2px rgba(255, 255, 255, 0.5)"
            background="repeating-linear-gradient(0deg, rgba(200, 200, 200, 0.4), rgba(200, 200, 200, 0.4) 1px,rgba(255, 255, 255, 0.4) 1px,rgba(255, 255, 255, 0.4) 2px)"
          >
            {/* Editor and board */}
            <Stack direction="row" h="100%">
              <Box
                id="editor-section"
                mr={0}
                position="relative"
                flexShrink={0}
                w={EDITOR_SECTION_RESPONSIVE_WIDTH}
                h="100%"
              >
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
              <Box id="board-wrapper" height="fit-content">
                <Board
                  gameState={boardState}
                  // Note: We only want to enable animations if the editor is in the "running" state.
                  // If the editor is in the "paused" state, it's more clear to move the sprites in
                  // discrete steps.
                  enableAnimations={editorState === "running"}
                  enableHoverInfo={editorState !== "running"}
                  scale={boardScale}
                  levelStyle={currLevel().style}
                  cameraText={currLevel().camera_text}
                  showDecoration={true}
                  filter={
                    currLevel().style === "glossy_tiles"
                      ? "brightness(0.8) contrast(0.85) saturate(1.2)"
                      : ""
                  }
                />
              </Box>
            </Stack>
          </Box>
        </Flex>
      </Box>
    </>
  );
}
