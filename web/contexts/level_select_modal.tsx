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
import {
  useSceneNavigator,
  useCurrScene,
  useLevels,
} from "../hooks/scenes_hooks";
import Board from "../components/board/board";
import LevelSelectOption from "../components/level_select_option";
import { ResponsiveModalCloseButton } from "../components/modal/responsive_modal_close_button";

import "../styles/effects.css";

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

export function LevelSelectModalProvider(props: PropsWithChildren<{}>) {
  const LEVELS = useLevels();
  const router = useRouter();
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
    if (currScene && currScene.type === "level") {
      return currScene;
    }
    return LEVELS[0];
  });

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
                  <Stack borderRight="1px solid black">
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
                      w="fit-content"
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
                  <Stack p="30px">
                    <Text fontSize="24px" fontWeight="bold" mt="2px" mb="2px">
                      Level {selectedScene?.levelIndex || 0}:{" "}
                      {selectedScene.level?.name}
                    </Text>

                    <Box
                      id="level-select-preview-outer-wrapper"
                      overflow="hidden"
                      position="relative"
                    >
                      <Box
                        id="level-select-preview-inner-wrapper"
                        zIndex={999999999}
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
                        scale={0.8}
                        filter="grayscale(1)"
                      />
                    </Box>
                    <Button
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
