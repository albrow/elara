import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Box,
  ModalCloseButton,
  Flex,
} from "@chakra-ui/react";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { FaThumbsUp } from "react-icons/fa";
import { HINTS_MODAL_Z_INDEX } from "../lib/constants";

export const HintsModalContext = createContext<
  readonly [() => void, (onClose: () => void) => void]
>([
  () => {
    throw new Error("useHintsModal must be used within a HintsModalContext");
  },
  () => {
    throw new Error("useHintsModal must be used within a HintsModalContext");
  },
] as const);

// A custom hook for showing and hiding the error modal.
export const useHintsModal = () => useContext(HintsModalContext);

export function HintsModalProvider(props: PropsWithChildren<{}>) {
  const [visible, setVisible] = useState<boolean>(false);
  const [givenOnClose, setGivenOnClose] = useState<(() => void) | undefined>(
    undefined
  );

  const setHintsModalOnClose = useCallback(
    (onClose: () => void) => {
      setGivenOnClose(() => onClose);
    },
    [setGivenOnClose]
  );

  const showHintsModal = useCallback(() => {
    setVisible(true);
  }, []);

  const providerValue = useMemo(
    () => [showHintsModal, setHintsModalOnClose] as const,
    [showHintsModal, setHintsModalOnClose]
  );

  const handleClose = useCallback(() => {
    setVisible(false);
    if (givenOnClose) {
      givenOnClose();
    }
  }, [givenOnClose]);

  return (
    <HintsModalContext.Provider value={providerValue}>
      {visible && (
        <Box hidden={!visible} zIndex={HINTS_MODAL_Z_INDEX}>
          <Modal
            isOpen={visible}
            onClose={handleClose}
            scrollBehavior="inside"
            preserveScrollBarGap
            closeOnOverlayClick={false}
          >
            <ModalOverlay zIndex={HINTS_MODAL_Z_INDEX} />
            <ModalContent minW="container.md" zIndex={HINTS_MODAL_Z_INDEX + 1}>
              <ModalCloseButton />
              <ModalBody>
                <Text
                  fontSize={32}
                  fontWeight="bold"
                  mt="10px"
                  mb="5px"
                  align="center"
                >
                  Hints
                </Text>
                <Box maxW="500px" mx="auto">
                  <Text fontSize={18} lineHeight="1.4em" mt="18px">
                    <ul>
                      <li>This is a hint</li>
                      <li>This is another hint</li>
                      <li>This is a hint</li>
                    </ul>
                  </Text>
                </Box>
                <Flex mt={10} mb={3} justifyContent="right" w="100%">
                  <Button colorScheme="blue" onClick={handleClose}>
                    Got it!
                    <FaThumbsUp
                      size="1.0em"
                      style={{ marginLeft: "0.4rem", marginBottom: "0.2rem" }}
                    />
                  </Button>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>
      )}
      {props.children}
    </HintsModalContext.Provider>
  );
}
