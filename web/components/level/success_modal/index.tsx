import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
  ModalCloseButton,
  Button,
  Text,
  Flex,
} from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";
import { MdArrowForward, MdHome, MdMovie, MdReplay } from "react-icons/md";
import { Animate, AnimateGroup } from "react-simple-animate";

import type { RunResult } from "../../../../elara-lib/pkg/elara_lib";
import { useCurrScene, useSceneNavigator } from "../../../hooks/scenes_hooks";
import { getNextLevel } from "../../../lib/utils";
import { Scene } from "../../../lib/scenes";
import { useSaveData } from "../../../hooks/save_data_hooks";
import ModalStats from "./modal_stats";
import ModalObjective from "./modal_objective";
import ModalChallenge from "./modal_challenge";

interface LevelSuccessModalProps {
  result: RunResult | null;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}

export default function LevelSuccessModal(props: LevelSuccessModalProps) {
  const { navigateToScene, navigateToHub } = useSceneNavigator();
  // const router = useRouter();
  const currScene = useCurrScene();
  const currLevel = useMemo(() => currScene?.level, [currScene]);
  if (!currLevel) {
    throw new Error("currLevel must be non-null");
  }
  const nextLevel = useMemo(() => getNextLevel(currScene!), [currScene]);
  const [{ seenCutscenes }] = useSaveData();

  // const isLastScene = useMemo(() => currScene?.nextScene == null, [currScene]);

  const handleClose = useCallback(() => {
    props.setVisible(false);
    if (props.onClose) {
      props.onClose();
    }
  }, [props]);

  const onNextClick = useCallback(
    (nextLevelScene: Scene) => {
      handleClose();
      // TODO(albrow): Figure out a different way to show the end screen.
      // if (isLastScene) {
      //   setTimeout(() => router.navigate("end"), 0);
      // } else {
      //   navigateToNextScene();
      // }
      navigateToScene(nextLevelScene);
    },
    [handleClose, navigateToScene]
  );

  // Returns the cutscene id of the next scene if it is a cutscene, or null
  // if the next scene should not be a cutscene.
  const nextCutsceneId = useMemo(() => {
    if (!currScene) {
      return null;
    }
    if (
      currScene.nextScene?.type === "cutscene" &&
      !currScene.nextScene.completed
    ) {
      return currScene.nextScene.cutsceneId;
    }
    return null;
  }, [currScene]);

  if (!props.visible) {
    return null;
  }

  if (props.result == null) {
    throw new Error("result must be non-null if visible is true");
  }

  return (
    <Box hidden={!props.visible}>
      <Modal
        isOpen={props.visible}
        onClose={handleClose}
        scrollBehavior="inside"
        preserveScrollBarGap
        closeOnOverlayClick={false}
        autoFocus={false}
      >
        <ModalOverlay />
        <ModalContent minW="container.md">
          <ModalCloseButton />
          <ModalBody>
            <Text
              fontSize={32}
              fontWeight="bold"
              mt="10px"
              mb="5px"
              align="center"
            >
              Great Job!
            </Text>
            <AnimateGroup play>
              {props.result.stats && (
                <ModalStats stats={props.result.stats} animIndexStart={0} />
              )}
              <ModalObjective
                objective={currLevel.objective}
                animIndexStart={100}
              />
              {currLevel.challenge !== "" && (
                <ModalChallenge result={props.result} animIndexStart={200} />
              )}
              <Animate
                sequenceIndex={300}
                delay={0.5}
                start={{ opacity: 0 }}
                end={{ opacity: 1 }}
              >
                <Flex mt={10} mb={3} justifyContent="right" w="100%">
                  <Button colorScheme="blackAlpha" onClick={handleClose}>
                    Play Level Again
                    <MdReplay size="1.3em" style={{ marginLeft: "0.2rem" }} />
                  </Button>
                  {nextCutsceneId &&
                    !seenCutscenes.includes(nextCutsceneId) && (
                      <Button
                        ml="5px"
                        colorScheme="purple"
                        onClick={() => {
                          handleClose();
                          navigateToScene(currScene!.nextScene!);
                        }}
                      >
                        Play Cutscene
                        <MdMovie
                          size="1.3em"
                          style={{ marginLeft: "0.2rem" }}
                        />
                      </Button>
                    )}
                  {!nextCutsceneId && (
                    <Button colorScheme="blue" onClick={navigateToHub} ml="5px">
                      Back to Hub
                      <MdHome size="1.3em" style={{ marginLeft: "0.2rem" }} />
                    </Button>
                  )}
                  {nextLevel?.unlocked && (
                    <Button
                      colorScheme="teal"
                      onClick={() => onNextClick(nextLevel!)}
                      ml="5px"
                    >
                      Next Level
                      <MdArrowForward
                        size="1.3em"
                        style={{ marginLeft: "0.2rem" }}
                      />
                    </Button>
                  )}
                </Flex>
              </Animate>
            </AnimateGroup>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
