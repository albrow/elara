import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
} from "@chakra-ui/react";
import React, { useCallback } from "react";

import { useSaveData } from "../../hooks/save_data_hooks";
import { DIALOG_MODAL_Z_INDEX } from "../../lib/constants";
import DialogTree from "./dialog_tree";

export type LevelOutcome = "success" | "failure" | "no_objective";

interface DialogModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  treeName: string | null;
  onClose?: () => void;
}

export default function DialogModal(props: DialogModalProps) {
  const [_, { markDialogSeen }] = useSaveData();

  const handleClose = useCallback(() => {
    if (props.treeName != null) {
      markDialogSeen(props.treeName);
    }

    props.setVisible(false);
    if (props.onClose) {
      props.onClose();
    }
  }, [props, markDialogSeen]);

  return (
    <Box hidden={!props.visible} zIndex={DIALOG_MODAL_Z_INDEX}>
      <Modal
        isOpen={props.visible}
        onClose={handleClose}
        scrollBehavior="inside"
        preserveScrollBarGap
        closeOnEsc={false}
        closeOnOverlayClick={false}
      >
        <ModalOverlay zIndex={DIALOG_MODAL_Z_INDEX} />
        <ModalContent
          className="light-scrollbar"
          minW="container.lg"
          zIndex={DIALOG_MODAL_Z_INDEX + 1}
          bottom="16px"
          my={0}
          position="fixed"
          maxH="50vh"
        >
          <ModalBody>
            {props.treeName && (
              <DialogTree treeName={props.treeName} onEnd={handleClose} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
