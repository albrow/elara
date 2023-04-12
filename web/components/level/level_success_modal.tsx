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
  Badge,
} from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";
import {
  MdArrowForward,
  MdCheckCircle,
  MdLocalGasStation,
  MdOutlineTextSnippet,
  MdOutlineTimer,
  MdReplay,
} from "react-icons/md";
import { Animate, AnimateGroup, AnimateKeyframes } from "react-simple-animate";

import { BsStar, BsStarFill } from "react-icons/bs";
import type { RunResult } from "../../../elara-lib/pkg/elara_lib";
import { LEVEL_END_MODAL_Z_INDEX } from "../../lib/constants";
import { useCurrScene, useSceneNavigator } from "../../contexts/scenes";
import ObjectiveText from "./objective_text";
import ChallengeText from "./challenge_text";

interface LevelEndModalProps {
  result: RunResult | null;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}

export default function LevelEndModal(props: LevelEndModalProps) {
  const { navigateToNextScene } = useSceneNavigator();
  const currScene = useCurrScene();
  const currLevel = useMemo(() => currScene?.level, [currScene]);
  if (!currLevel) {
    throw new Error("currLevel must be non-null");
  }

  const getChallengeIcon = useCallback((completed: boolean) => {
    if (completed) {
      return (
        <AnimateKeyframes
          sequenceIndex={6}
          play
          keyframes={[
            { 0: "opacity: 0%; transform: scale(4) rotate(360deg);" },
            { 100: "opacity: 100%; transform: scale(1) rotate(0deg);" },
          ]}
          fillMode="forwards"
          direction="normal"
          render={({ style }) => (
            <BsStarFill
              size="1.1em"
              color="var(--chakra-colors-yellow-400)"
              style={{
                opacity: 0,
                marginRight: "0.2rem",
                display: "inline",
                verticalAlign: "middle",
                ...style,
              }}
            />
          )}
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
  }, []);

  const handleClose = useCallback(() => {
    props.setVisible(false);
    if (props.onClose) {
      props.onClose();
    }
  }, [props]);

  const onNextClick = useCallback(() => {
    handleClose();
    navigateToNextScene();
  }, [handleClose, navigateToNextScene]);

  if (!props.visible) {
    return null;
  }

  if (props.result == null) {
    throw new Error("result must be non-null if visible is true");
  }

  // TODO(albrow): Fix issues with z-index. Doesn't seem to be respecting the
  // values I'm setting here, and the player message can sometimes appear on
  // top of the modal.
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
                <Flex
                  w="65%"
                  mx="auto"
                  my="18px"
                  justifyContent="space-between"
                >
                  <Animate
                    sequenceIndex={0}
                    delay={0.2}
                    start={{ opacity: 0 }}
                    end={{ opacity: 1 }}
                  >
                    <Badge colorScheme="purple" px="9px" py="3px" fontSize="sm">
                      <Flex direction="row" mt="0.12rem">
                        <MdOutlineTimer
                          size="1.2em"
                          style={{
                            marginRight: "0.1rem",
                            marginTop: "0.1rem",
                          }}
                        />
                        {`Time: ${props.result.stats.time_taken} steps`}
                      </Flex>
                    </Badge>
                  </Animate>
                  <Animate
                    sequenceIndex={1}
                    delay={0.05}
                    start={{ opacity: 0 }}
                    end={{ opacity: 1 }}
                  >
                    <Badge colorScheme="green" px="9px" py="3px" fontSize="sm">
                      <Flex direction="row" mt="0.12rem">
                        <MdLocalGasStation
                          size="1.2em"
                          style={{
                            marginRight: "0.1rem",
                            marginTop: "0.1rem",
                          }}
                        />
                        {`Fuel Used: ${props.result.stats.fuel_used}`}
                      </Flex>
                    </Badge>
                  </Animate>
                  <Animate
                    sequenceIndex={2}
                    delay={0.05}
                    start={{ opacity: 0 }}
                    end={{ opacity: 1 }}
                  >
                    <Badge colorScheme="blue" px="9px" py="3px" fontSize="sm">
                      <Flex direction="row" mt="0.12rem">
                        <MdOutlineTextSnippet
                          size="1.2em"
                          style={{
                            marginRight: "0.1rem",
                            marginTop: "0.1rem",
                          }}
                        />
                        {`Code Length: ${props.result.stats.code_len}`}
                      </Flex>
                    </Badge>
                  </Animate>
                </Flex>
              )}
              <Animate
                sequenceIndex={3}
                delay={0.5}
                start={{ opacity: 0 }}
                end={{ opacity: 1 }}
              >
                <Box mx="auto" mt="15px" textAlign="center">
                  <AnimateKeyframes
                    sequenceIndex={4}
                    play
                    keyframes={[
                      { 0: "opacity: 0%; transform: scale(3);" },
                      { 100: "opacity: 100%; transform: scale(1);" },
                    ]}
                    fillMode="forwards"
                    direction="normal"
                    render={({ style }) => (
                      <MdCheckCircle
                        size="1.1em"
                        color="var(--chakra-colors-green-400)"
                        style={{
                          opacity: "0%",
                          marginRight: "0.2rem",
                          display: "inline",
                          verticalAlign: "middle",
                          ...style,
                        }}
                      />
                    )}
                  />
                  <Text as="span" verticalAlign="middle" fontWeight="bold">
                    Objective:
                  </Text>{" "}
                  <ObjectiveText text={currLevel.objective} />
                </Box>
              </Animate>
              {currLevel.challenge !== "" && (
                <Animate
                  sequenceIndex={5}
                  delay={0.5}
                  start={{ opacity: 0 }}
                  end={{ opacity: 1 }}
                >
                  <Box mx="auto" mt="15px" textAlign="center">
                    {getChallengeIcon(props.result.passes_challenge)}
                    <Text as="span" verticalAlign="middle" fontWeight="bold">
                      Challenge:
                    </Text>{" "}
                    <ChallengeText text={currLevel.challenge} />
                    {!props.result.passes_challenge && (
                      <Animate
                        sequenceIndex={7}
                        delay={0.1}
                        start={{ opacity: 0 }}
                        end={{ opacity: 1 }}
                      >
                        <Text fontStyle="italic" fontSize="sm">
                          (You might need to learn more and then come back
                          later.)
                        </Text>
                      </Animate>
                    )}
                    {props.result.passes_challenge &&
                      currLevel.challenge
                        .toLowerCase()
                        .includes("code length") && (
                        <Animate
                          sequenceIndex={7}
                          delay={0.1}
                          start={{ opacity: 0 }}
                          end={{ opacity: 1 }}
                        >
                          <Text fontStyle="italic" fontSize="sm">
                            (Keep in mind, in the real world{" "}
                            <b>more readable</b> code is better than{" "}
                            <b>shorter</b> code. This challenge is just for
                            fun!)
                          </Text>
                        </Animate>
                      )}
                  </Box>
                </Animate>
              )}
              <Animate
                sequenceIndex={999}
                delay={0.5}
                start={{ opacity: 0 }}
                end={{ opacity: 1 }}
              >
                <Flex mt={10} mb={3} justifyContent="right" w="100%">
                  <Button colorScheme="blackAlpha" onClick={handleClose}>
                    Keep Playing
                    <MdReplay size="1.3em" style={{ marginLeft: "0.2rem" }} />
                  </Button>
                  <Button colorScheme="blue" ml={2} onClick={onNextClick}>
                    Next
                    <MdArrowForward
                      size="1.3em"
                      style={{ marginLeft: "0.2rem" }}
                    />
                  </Button>
                </Flex>
              </Animate>
            </AnimateGroup>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
