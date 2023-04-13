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
import { MdReplay } from "react-icons/md";

import { LEVEL_END_MODAL_Z_INDEX } from "../../lib/constants";

interface LevelFailureModalProps {
  kind: "error" | "continue";
  error?: string;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}

export default function LevelFailureModal(props: LevelFailureModalProps) {
  const handleClose = useCallback(() => {
    props.setVisible(false);
    if (props.onClose) {
      props.onClose();
    }
  }, [props]);

  const title = useMemo(
    () => (props.kind === "error" ? "Uh Oh!" : "Keep Going!"),
    [props.kind]
  );

  const message = useMemo(() => {
    if (props.kind === "continue") {
      return "You didn't quite complete the objective, but you're on the right track!";
    }
    if (props.error !== "") {
      return props.error;
    }
    return "An unexpected error occurred. Please try again.";
  }, [props.kind, props.error]);

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
            <Text fontSize={32} fontWeight="bold">
              {title}
            </Text>
            <Text fontSize={18} lineHeight="1.4em" mt={6}>
              {message}
            </Text>
            <Flex mt={10} mb={3} justifyContent="right" w="100%">
              <Button colorScheme="blackAlpha" onClick={handleClose}>
                Try Again
                <MdReplay size="1.3em" style={{ marginLeft: "0.2rem" }} />
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
