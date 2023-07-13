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
import { MdArrowForward, MdHome, MdReplay } from "react-icons/md";
import { Animate, AnimateGroup } from "react-simple-animate";

import { useRouter } from "react-router5";
import type { RunResult } from "../../../../elara-lib/pkg/elara_lib";
import { LEVEL_END_MODAL_Z_INDEX } from "../../../lib/constants";
import { useCurrScene, useSceneNavigator } from "../../../hooks/scenes_hooks";
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
  const { navigateToNextScene, navigateToHub } = useSceneNavigator();
  const router = useRouter();
  const currScene = useCurrScene();
  const currLevel = useMemo(() => currScene?.level, [currScene]);
  if (!currLevel) {
    throw new Error("currLevel must be non-null");
  }

  const isLastScene = useMemo(() => currScene?.nextScene == null, [currScene]);

  const handleClose = useCallback(() => {
    props.setVisible(false);
    if (props.onClose) {
      props.onClose();
    }
  }, [props]);

  const onNextClick = useCallback(() => {
    handleClose();
    if (isLastScene) {
      setTimeout(() => router.navigate("end"), 0);
    } else {
      navigateToNextScene();
    }
  }, [handleClose, isLastScene, navigateToNextScene, router]);

  if (!props.visible) {
    return null;
  }

  if (props.result == null) {
    throw new Error("result must be non-null if visible is true");
  }

  return (
    <Box hidden={!props.visible} zIndex={LEVEL_END_MODAL_Z_INDEX}>
      <Modal
        isOpen={props.visible}
        onClose={handleClose}
        scrollBehavior="inside"
        preserveScrollBarGap
        closeOnOverlayClick={false}
      >
        <ModalOverlay zIndex={LEVEL_END_MODAL_Z_INDEX} />
        <ModalContent minW="container.md" zIndex={LEVEL_END_MODAL_Z_INDEX + 1}>
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
                    Keep Playing
                    <MdReplay size="1.3em" style={{ marginLeft: "0.2rem" }} />
                  </Button>
                  <Button colorScheme="blue" onClick={navigateToHub} ml="5px">
                    Back to Hub
                    <MdHome size="1.3em" style={{ marginLeft: "0.2rem" }} />
                  </Button>
                  {currScene?.nextScene?.type === "level" && (
                    <Button colorScheme="teal" onClick={onNextClick} ml="5px">
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
