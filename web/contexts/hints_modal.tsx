import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Box,
  Flex,
} from "@chakra-ui/react";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import { FaThumbsUp } from "react-icons/fa";

import { useCurrScene } from "../hooks/scenes_hooks";
import { ResponsiveModalCloseButton } from "../components/modal/responsive_modal_close_button";

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

// Helper for parsing hints. The raw strings may contain code surrounded
// in backticks. This function will replace the backticks with <code> tags.
function parseHint(hint: string): (string | JSX.Element)[] {
  // First use a regex to split the hint text into segments, where each segment
  // is either code like "`move_forward(3)`" or a string of text.
  const segments = hint.split(/(`.*?`)/);

  // Then map each segment to either a string or a code block.
  return segments.map((segment) => {
    if (segment.startsWith("`") && segment.endsWith("`")) {
      return <code key={segment}>{segment.slice(1, -1)}</code>;
    }
    return segment;
  });
}

export function HintsModalProvider(props: PropsWithChildren<{}>) {
  const [visible, setVisible] = useState<boolean>(false);
  const [givenOnClose, setGivenOnClose] = useState<(() => void) | undefined>(
    undefined
  );
  const currScene = useCurrScene();

  const setHintsModalOnClose = useCallback(
    (onClose: () => void) => {
      setGivenOnClose(() => onClose);
    },
    [setGivenOnClose]
  );

  const showHintsModal = useCallback(() => {
    if (!currScene) {
      throw new Error("Could not get current scene.");
    }
    if (currScene.hints == null || currScene.hints.length === 0) {
      throw new Error("Current scene does not have any hints.");
    }
    setVisible(true);
  }, [currScene]);

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
            <ModalContent
              minW={{
                base: "container.md",
                // "3xl": "container.lg",
              }}
            >
              <ResponsiveModalCloseButton />
              <ModalBody>
                <Text
                  fontSize="2rem"
                  fontWeight="bold"
                  mt={{
                    base: "10px",
                    // "3xl": "20px",
                  }}
                  mb="5px"
                  align="center"
                >
                  Hint(s)
                </Text>
                <Box
                  maxW={{
                    base: "650px",
                    // "3xl": "850px",
                  }}
                  mx="auto"
                  my="20px"
                  className="md-content"
                  // fontSize={BODY_RESPONSIVE_FONT_SCALE}
                >
                  <Text as="span" lineHeight="1.4em" mt="18px">
                    {currScene?.hints && currScene.hints.length > 0 && (
                      <ul>
                        {currScene.hints.map((hint, i) => (
                          <li
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${currScene!.name}_hint_${i}`}
                            style={{ marginTop: "1.0em" }}
                          >
                            {parseHint(hint)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Text>
                </Box>
                {currScene?.level?.challenge && (
                  <Box>
                    <Text align="center" fontSize="0.9rem" fontStyle="italic">
                      (Hints do not necessarily apply to optional challenges.)
                    </Text>
                  </Box>
                )}
                <Flex mt={10} mb={3} justifyContent="right" w="100%">
                  <Button
                    // fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
                    // size={BUTTON_RESPONSIVE_SCALE}
                    colorScheme="blue"
                    onClick={handleClose}
                  >
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
