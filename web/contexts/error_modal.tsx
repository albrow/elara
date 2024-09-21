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
  Image,
} from "@chakra-ui/react";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import { MdOutlineErrorOutline, MdReplay } from "react-icons/md";
import { compiler } from "markdown-to-jsx";

import errorNoButtonImg from "../images/error_messages/error_no_button.png";
import errorNoDataPointImg from "../images/error_messages/error_no_data_point.png";

export type ErrorModalKind = "error" | "continue";

export type ErrorType = "err_no_data_point" | "err_no_button";

export const ErrorModalContext = createContext<
  readonly [
    (kind: ErrorModalKind, error?: string, errType?: ErrorType) => void,
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

export function ErrorModalProvider(props: PropsWithChildren<{}>) {
  const [visible, setVisible] = useState<boolean>(false);
  const [modalKind, setModalKind] = useState<ErrorModalKind>("error");
  const [errType, setErrType] = useState<string | undefined>(undefined);
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

  const showErrorModal = useCallback(
    (kind: ErrorModalKind, error?: string, errorType?: string) => {
      setModalKind(kind);
      setErrorMessage(error);
      setVisible(true);
      setErrType(errorType);
    },
    []
  );

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

  const getIconOrImage = useCallback(() => {
    if (modalKind === "error") {
      if (errType === "err_no_button") {
        return <Image src={errorNoButtonImg} maxW="500px" margin="auto" />;
      }
      if (errType === "err_no_data_point") {
        return <Image src={errorNoDataPointImg} maxW="500px" margin="auto" />;
      }
      if (errType !== undefined) {
        throw new Error(`Unknown error type: ${errType}`);
      }
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
  }, [errType, modalKind]);

  const formattedMessage = useMemo(() => {
    if (errType === "err_no_button") {
      return compiler(
        "The `press_button` function only works if G.R.O.V.E.R. is next to a button. (He _doesn't_ have to be facing it)."
      );
    }
    if (errType === "err_no_data_point") {
      return compiler(
        "The `read_data` function only works if G.R.O.V.E.R. is next to a data point. (He _doesn't_ have to be facing it.)"
      );
    }
    return message;
  }, [errType, message]);

  return (
    <ErrorModalContext.Provider value={providerValue}>
      {visible && (
        <Box hidden={!visible}>
          <Modal
            isOpen={visible}
            onClose={handleClose}
            scrollBehavior="inside"
            preserveScrollBarGap
            closeOnOverlayClick={false}
            autoFocus={false}
          >
            <ModalOverlay />
            <ModalContent minW="container.md">
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
                <Box my="20px" mx="auto">
                  {getIconOrImage()}
                </Box>
                <Box maxW="500px" mx="auto">
                  <Text
                    fontSize={18}
                    lineHeight="1.4em"
                    mt="18px"
                    align="center"
                    className="md-content"
                  >
                    {formattedMessage}
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
