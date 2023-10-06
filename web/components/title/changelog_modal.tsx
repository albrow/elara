import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
  Box,
} from "@chakra-ui/react";

import { useCallback } from "react";
import Changelog from "../changelog.mdx";

export interface ChangelogModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ChangelogModal(props: ChangelogModalProps) {
  const onClose = useCallback(() => {
    props.setVisible(false);
  }, [props]);

  return (
    <Modal
      isOpen={props.visible}
      onClose={onClose}
      autoFocus={false}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent
        w="container.md"
        maxW="100%"
        maxH="100%"
        top={{
          base: "0px",
          "2xl": "24px",
        }}
        bottom={{
          base: "0px",
          "2xl": "24px",
        }}
        my={{
          base: "0px",
          md: "24px",
          lg: "48px",
        }}
        py="24px"
        px="12px"
        position="fixed"
      >
        <ModalCloseButton />
        <ModalBody>
          <Box className="md-content">
            <Changelog />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
