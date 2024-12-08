import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
  Text,
  Flex,
  Stack,
  Button,
} from "@chakra-ui/react";
import React, {
  createContext,
  PropsWithChildren,
  useMemo,
  useState,
  useCallback,
} from "react";

import { useRouter } from "react-router5";
import { MdCheckCircle, MdCheckCircleOutline } from "react-icons/md";
import { BsStar, BsStarFill } from "react-icons/bs";
import {
  useSceneNavigator,
  useCurrScene,
  useLevels,
  useNextUnlockedScene,
} from "../hooks/scenes_hooks";
import Board from "../components/board/board";
import LevelSelectOption from "../components/level_select_option";
import { ResponsiveModalCloseButton } from "../components/modal/responsive_modal_close_button";

import "../styles/effects.css";
import ObjectiveText from "../components/level/objective_text";
import ChallengeText from "../components/level/challenge_text";
import { Scene } from "../lib/scenes";
import { getBoardDimensions } from "../lib/board_utils";
import { LEVEL_SELECT_OVERLAY_Z_INDEX } from "../lib/constants";

/**
 * Provider for a modal that displays a list of levels that the user can choose
 * from.
 *
 * The context is an array that consists of one function, showLevelSelectModal.
 * This function can be called to show the modal.
 */
export const LevelSelectModalContext = createContext<readonly [() => void]>([
  () => {
    throw new Error(
      "useLevelSelectModal must be used within a LevelSelectModalContext"
    );
  },
] as const);

function getMiniObjectiveIcon(scene: Scene) {
  if (scene !== null && scene.completed) {
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
}

function getMiniChallengeIcon(scene: Scene) {
  if (scene !== null && scene.challengeCompleted) {
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
}

export function LevelSelectModalProvider(props: PropsWithChildren<{}>) {
  const LEVELS = useLevels();
  const router = useRouter();
  const nextUnlockedScene = useNextUnlockedScene();
  const currScene = useCurrScene();
  const { navigateToScene } = useSceneNavigator();

  const [visible, setVisible] = useState<boolean>(false);

  const showLevelSelectModal = useCallback(() => {
    setVisible(true);
  }, []);

  const providerValue = useMemo(
    () => [showLevelSelectModal] as const,
    [showLevelSelectModal]
  );

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const [selectedScene, setSelectedScene] = useState(() => {
    // If the current scene is a level, start with that level selected.
    // This can happen when using the "Choose level" button at the top of the
    // level screen.
    if (currScene && currScene.type === "level") {
      return currScene;
    }
    // Next, check if the next unlocked scene is a level. If so, automatically
    // select that level.
    if (nextUnlockedScene.type === "level") {
      return nextUnlockedScene;
    }
    // Otherwise, default to the first level.
    return LEVELS[0];
  });

  const levelPreviewScale = 0.86;
  const boardDims = useMemo(() => getBoardDimensions(levelPreviewScale), []);

  return (
    <LevelSelectModalContext.Provider value={providerValue}>
      {visible && (
        <Box hidden={!visible}>
          <Modal
            isOpen={visible}
            onClose={handleClose}
            scrollBehavior="outside"
            preserveScrollBarGap
            motionPreset="slideInBottom"
            autoFocus={false}
            size="4xl"
          >
            <ModalOverlay />
            <ModalContent h="600px" bg="gray.700" color="white">
              <ResponsiveModalCloseButton />
              <ModalBody id="level-select-modal-body" p="0px" h="100%">
                <Flex h="100%">
                  <Stack borderRight="1px solid black" w="336px" flexShrink={0}>
                    <Box p="6px" pt="16px">
                      <Text
                        fontSize="24px"
                        fontWeight="bold"
                        mt="2px"
                        mb="2px"
                        align="center"
                      >
                        Choose Level
                      </Text>
                    </Box>
                    <Box
                      bg="gray.800"
                      overflowY="auto"
                      className="dark-scrollbar scrollbar-left"
                      h="100%"
                      w="100%"
                      p="6px"
                    >
                      {LEVELS.map((scene) => (
                        <Box key={scene.name}>
                          <LevelSelectOption
                            scene={scene}
                            key={router.buildPath(
                              scene.routeName,
                              scene.routeParams
                            )}
                            isLocked={!scene.unlocked}
                            isActive={scene.level === selectedScene.level}
                            onClick={() => {
                              if (scene.unlocked) {
                                setSelectedScene(scene);
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                  <Stack p="16px" w="100%">
                    <Box
                      mt="28px"
                      mb="8px"
                      id="level-select-preview-outer-wrapper"
                      overflow="hidden"
                      position="relative"
                      w={`${boardDims.innerWidth}px`}
                      h={`${boardDims.innerHeight}px`}
                    >
                      <Box
                        id="level-select-preview-inner-wrapper"
                        zIndex={LEVEL_SELECT_OVERLAY_Z_INDEX}
                        position="absolute"
                        top="0"
                        left="0"
                        w="100%"
                        h="100%"
                        // Add an heavy inner shadow
                        boxShadow="inset 0 0 10px 10px rgba(0, 0, 0, 0.5)"
                        _before={{
                          content: '" "',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          background:
                            "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                          zIndex: 2,
                          backgroundSize: "100% 2px, 3px 100%",
                          pointerEvents: "none",
                        }}
                      />
                      <Board
                        gameState={selectedScene.level!.initial_state}
                        asteroidWarnings={
                          selectedScene.level!.asteroid_warnings
                        }
                        enableAnimations={false}
                        enableHoverInfo={false}
                        showInitialState
                        scale={levelPreviewScale}
                        filter="grayscale(1)"
                        showDecoration={false}
                      />
                    </Box>
                    <Text fontSize="24px" fontWeight="bold" mt="2px" mb="2px">
                      Level {selectedScene?.levelIndex || 0}:{" "}
                      {selectedScene.level?.name}
                    </Text>
                    <Box fontSize="14px">
                      <Text as="span" verticalAlign="middle">
                        {getMiniObjectiveIcon(selectedScene)}
                        <Text
                          as="span"
                          verticalAlign="middle"
                          fontWeight="bold"
                        >
                          Objective:
                        </Text>{" "}
                        <ObjectiveText
                          text={selectedScene?.level?.objective || ""}
                        />
                      </Text>
                      {selectedScene?.level?.challenge !== "" &&
                        selectedScene?.completed && (
                          <>
                            <br />
                            <Text as="span" verticalAlign="middle">
                              {getMiniChallengeIcon(selectedScene)}
                              <Text
                                as="span"
                                verticalAlign="middle"
                                fontWeight="bold"
                              >
                                Challenge:
                              </Text>{" "}
                              <ChallengeText
                                text={selectedScene?.level?.challenge || ""}
                              />
                            </Text>
                          </>
                        )}
                    </Box>
                    <Box flexGrow={1} />
                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        navigateToScene(selectedScene);
                        handleClose();
                      }}
                    >
                      Go!
                    </Button>
                  </Stack>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>
      )}
      {props.children}
    </LevelSelectModalContext.Provider>
  );
}
