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
  Image,
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
  onClose?: () => void;
}

const SUCCESS_GIFS = [
  "https://media.giphy.com/media/1zi3fJI4GcldIhyjP7/giphy.gif",
  "https://media.giphy.com/media/vViFKLAOQdDlS/giphy.gif",
  "https://media.giphy.com/media/Q81NcsY6YxK7jxnr4v/giphy.gif",
  "https://media.giphy.com/media/5tgVJmQBd2vBIm7l6B/giphy.gif",
  "https://media.giphy.com/media/3ohhwo4PzDFaz2sADu/giphy.gif",
  "https://media.giphy.com/media/qlrBlSDevEdFeW5JwV/giphy.gif",
  "https://media.giphy.com/media/2sXf9PbHcEdE1x059I/giphy.gif",
  "https://media.giphy.com/media/HLoJUnVVvyJkcGgxsv/giphy.gif",
  "https://media.giphy.com/media/xCgeEazpis53cUqoZY/giphy.gif",
  "https://media.giphy.com/media/slOhiKAVFgwr6/giphy.gif",
  "https://media.giphy.com/media/3oKGzqGBF7OFccgrn2/giphy.gif",
  "https://media.giphy.com/media/26uffIRfNMzrTCvok/giphy.gif",
  "https://media.giphy.com/media/3XFwB5TrJ5L6rXqXEj/giphy.gif",
  "https://media.giphy.com/media/L1QCVBfYWwxjRV6NJ1/giphy.gif",
  "https://media.giphy.com/media/H1NIKdfygAAMruqArl/giphy.gif",
  "https://media.giphy.com/media/bw9sc2HXiK5ES9mJU4/giphy.gif",
  "https://media.giphy.com/media/YbHdkn9XLfqQE/giphy.gif",
];

function getRandomSuccessGif(): string {
  const index = Math.floor(Math.random() * SUCCESS_GIFS.length);
  return SUCCESS_GIFS[index];
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

  const handleClose = useCallback(() => {
    props.setVisible(false);
    if (props.onClose) {
      props.onClose();
    }
  }, [props]);

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
      >
        <ModalOverlay zIndex={LEVEL_END_MODAL_Z_INDEX} />
        <ModalContent minW="container.md" zIndex={LEVEL_END_MODAL_Z_INDEX + 1}>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize={32} fontWeight="bold">
              {props.title}
            </Text>
            <Text fontSize={18} lineHeight="1.4em" mt={6}>
              {isLastScene() && props.kind === "success"
                ? "You've completed all the levels! Check back again later for additional levels and content."
                : props.message}
            </Text>
            {props.kind === "success" && (
              <Flex justifyContent="center">
                <Image src={getRandomSuccessGif()} mt={6} maxH="42vh" />
              </Flex>
            )}
            <Flex mt={10} mb={3} justifyContent="right" w="100%">
              {props.kind === "success" && !isLastScene() && (
                <>
                  <Button colorScheme="blackAlpha" onClick={handleClose}>
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
                <Button colorScheme="blackAlpha" onClick={handleClose}>
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
