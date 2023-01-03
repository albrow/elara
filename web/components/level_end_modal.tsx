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
import React, { useCallback } from "react";
import { MdArrowForward, MdReplay } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

import { LEVEL_END_MODAL_Z_INDEX } from "../lib/constants";
import { getNextSceneFromRoute, SCENES } from "../lib/scenes";

export type LevelOutcome = "success" | "failure" | "no_objective";

interface LevelEndModalProps {
  title?: string;
  message?: string;
  kind: "success" | "failure";
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LevelEndModal(props: LevelEndModalProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isLastScene = useCallback(
    () => location.pathname === SCENES[SCENES.length - 1].route,
    [location.pathname]
  );

  const navigateToNextScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(location.pathname);
    if (nextScene == null) {
      throw new Error("Invalid route");
    }
    navigate(nextScene.route);
  }, [location, navigate]);

  // TODO(albrow): Fix issues with z-index. Doesn't seem to be respecting the
  // values I'm setting here, and the player message can sometimes appear on
  // top of the modal.
  return (
    <Box hidden={!props.visible} zIndex={LEVEL_END_MODAL_Z_INDEX}>
      <Modal
        isOpen={props.visible}
        onClose={() => props.setVisible(false)}
        scrollBehavior="inside"
        preserveScrollBarGap
      >
        <ModalOverlay zIndex={LEVEL_END_MODAL_Z_INDEX} />
        <ModalContent minW="container.md" zIndex={LEVEL_END_MODAL_Z_INDEX + 1}>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize={48} fontWeight="bold">
              {props.title}
            </Text>
            <Text fontSize={24} lineHeight="1.4em" mt={6}>
              {props.message}
            </Text>
            <Flex mt={10} mb={3} justifyContent="right" w="100%">
              {props.kind === "success" && !isLastScene() && (
                <>
                  <Button
                    colorScheme="blackAlpha"
                    onClick={() => props.setVisible(false)}
                  >
                    Keep Playing
                    <MdReplay size="1.3em" style={{ marginLeft: "0.2rem" }} />
                  </Button>
                  <Button
                    colorScheme="blue"
                    ml={2}
                    onClick={navigateToNextScene}
                  >
                    Next
                    <MdArrowForward
                      size="1.3em"
                      style={{ marginLeft: "0.2rem" }}
                    />
                  </Button>
                </>
              )}
              {props.kind === "failure" && (
                <Button
                  colorScheme="blackAlpha"
                  onClick={() => props.setVisible(false)}
                >
                  Try Again
                  <MdReplay size="1.3em" style={{ marginLeft: "0.2rem" }} />
                </Button>
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
