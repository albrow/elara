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
import { MdOutlineErrorOutline, MdReplay } from "react-icons/md";
import { LEVEL_END_MODAL_Z_INDEX } from "../lib/constants";

export type ErrorModalKind = "error" | "continue";

export const ErrorModalContext = createContext<
  readonly [
    (kind: ErrorModalKind, error?: string) => void,
    () => void,
    (onClose: () => void) => void
  ]
>([
  () => {
    throw new Error("useErrorModal must be used within a ErrorModalContext");
  },
  () => {
    throw new Error("useErrorModal must be used within a ErrorModalContext");
  },
  () => {
    throw new Error("useErrorModal must be used within a ErrorModalContext");
  },
] as const);

// A custom hook for showing and hiding the error modal.
export const useErrorModal = () => useContext(ErrorModalContext);

export function ErrorModalProvider(props: PropsWithChildren<{}>) {
  const [visible, setVisible] = useState<boolean>(false);
  const [modalKind, setModalKind] = useState<ErrorModalKind>("error");
  const [givenOnClose, setGivenOnClose] = useState<(() => void) | undefined>(
    undefined
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const setErrorModalOnClose = useCallback(
    (onClose: () => void) => {
      setGivenOnClose(() => onClose);
    },
    [setGivenOnClose]
  );

  const showErrorModal = useCallback((kind: ErrorModalKind, error?: string) => {
    setModalKind(kind);
    setErrorMessage(error);
    setVisible(true);
  }, []);

  const hideErrorModal = useCallback(() => {
    setVisible(false);
    setErrorMessage(undefined);
  }, []);

  const providerValue = useMemo(
    () => [showErrorModal, hideErrorModal, setErrorModalOnClose] as const,
    [showErrorModal, hideErrorModal, setErrorModalOnClose]
  );

  const handleClose = useCallback(() => {
    setVisible(false);
    if (givenOnClose) {
      givenOnClose();
    }
  }, [givenOnClose]);

  const title = useMemo(
    () => (modalKind === "error" ? "Uh Oh!" : "Keep Going!"),
    [modalKind]
  );

  const message = useMemo(() => {
    if (modalKind === "continue") {
      return "You didn't quite complete the objective, but you're on the right track!";
    }
    if (errorMessage !== "") {
      return errorMessage;
    }
    return "An unexpected error occurred. Please try again.";
  }, [modalKind, errorMessage]);

  const getIcon = useCallback(() => {
    if (modalKind === "error") {
      return (
        <MdOutlineErrorOutline
          style={{ margin: "auto", display: "block" }}
          size="4em"
          color="var(--chakra-colors-red-400)"
        />
      );
    }
    return (
      <MdReplay
        style={{ margin: "auto", display: "block" }}
        size="4em"
        color="var(--chakra-colors-blue-400)"
      />
    );
  }, [modalKind]);

  return (
    <ErrorModalContext.Provider value={providerValue}>
      {visible && (
        <Box hidden={!visible} zIndex={LEVEL_END_MODAL_Z_INDEX}>
          <Modal
            isOpen={visible}
            onClose={handleClose}
            scrollBehavior="inside"
            preserveScrollBarGap
            closeOnOverlayClick={false}
          >
            <ModalOverlay zIndex={LEVEL_END_MODAL_Z_INDEX} />
            <ModalContent
              minW="container.md"
              zIndex={LEVEL_END_MODAL_Z_INDEX + 1}
            >
              <ModalCloseButton />
              <ModalBody>
                <Text
                  fontSize={32}
                  fontWeight="bold"
                  mt="10px"
                  mb="5px"
                  align="center"
                >
                  {title}
                </Text>
                <Box my="20px">{getIcon()}</Box>
                <Box maxW="500px" mx="auto">
                  <Text
                    fontSize={18}
                    lineHeight="1.4em"
                    mt="18px"
                    align="center"
                  >
                    {message}
                  </Text>
                </Box>
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
      )}
      {props.children}
    </ErrorModalContext.Provider>
  );
}
