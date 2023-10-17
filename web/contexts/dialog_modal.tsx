import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Box,
} from "@chakra-ui/react";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import DialogTree from "../components/dialog/dialog_tree";
import { useSaveData } from "../hooks/save_data_hooks";

/**
 * A context that provides functions for showing/hiding a dialog modal.
 *
 * Consists of an array of two functions:
 *
 * - showDialogModal(dialogTreeName: string): void
 * - hideDialogModal(): void
 */
export const DialogModalContext = createContext<
  readonly [(dialogTreeName: string) => void, () => void]
>([
  () => {
    throw new Error("useDialogModal must be used within a DialogModalContext");
  },
  () => {
    throw new Error("useDialogModal must be used within a DialogModalContext");
  },
] as const);

export function DialogModalProvider(props: PropsWithChildren<{}>) {
  const [visible, setVisible] = useState<boolean>(false);
  const [dialogTreeName, setDialogTreeName] = useState<string | null>(null);
  const [_, { markDialogSeen }] = useSaveData();

  const showDialogModal = useCallback((treeName: string) => {
    setDialogTreeName(treeName);
    setVisible(true);
  }, []);

  const hideDialogModal = useCallback(() => {
    setDialogTreeName(null);
    setVisible(false);
  }, []);

  const providerValue = useMemo(
    () => [showDialogModal, hideDialogModal] as const,
    [showDialogModal, hideDialogModal]
  );

  const handleClose = useCallback(() => {
    markDialogSeen(dialogTreeName!);
    setVisible(false);
  }, [dialogTreeName, markDialogSeen]);

  return (
    <DialogModalContext.Provider value={providerValue}>
      {visible && (
        <Box hidden={!visible}>
          <Modal
            isOpen={visible}
            onClose={handleClose}
            scrollBehavior="inside"
            preserveScrollBarGap
            closeOnEsc={false}
            closeOnOverlayClick={false}
            autoFocus={false}
          >
            <ModalOverlay />
            <ModalContent
              className="light-scrollbar"
              minW="container.lg"
              bottom="16px"
              my={0}
              position="fixed"
              maxH="50vh"
            >
              <ModalBody>
                {dialogTreeName && (
                  <DialogTree treeName={dialogTreeName} onEnd={handleClose} />
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>
      )}
      {props.children}
    </DialogModalContext.Provider>
  );
}
