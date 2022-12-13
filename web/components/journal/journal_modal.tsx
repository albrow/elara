import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
  ModalCloseButton,
} from "@chakra-ui/react";
import React from "react";

import { JOURNAL_MODAL_Z_INDEX } from "../../lib/constants";
import JournalSection, { JournalProps } from "./journal_section";

interface JournalModalProps extends JournalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function JournalModal(props: JournalModalProps) {
  // TODO(albrow): Fix issues with z-index. Doesn't seem to be respecting the
  // values I'm setting here, and the player message can sometimes appear on
  // top of the modal.
  return (
    <Box hidden={!props.visible} zIndex={JOURNAL_MODAL_Z_INDEX}>
      <Modal
        isOpen={props.visible}
        onClose={() => props.setVisible(false)}
        scrollBehavior="inside"
        preserveScrollBarGap
      >
        <ModalOverlay zIndex={JOURNAL_MODAL_Z_INDEX} />
        <ModalContent minW="container.lg" zIndex={JOURNAL_MODAL_Z_INDEX + 1}>
          <ModalCloseButton />
          <ModalBody>
            <JournalSection section={props.section} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
