import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Image,
  Box,
  Stack,
} from "@chakra-ui/react";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { MdCheck } from "react-icons/md";

import { SHORTS, ShortId } from "../lib/tutorial_shorts";
import { useSaveData } from "../hooks/save_data_hooks";

export const ShortsModalContext = createContext<
  readonly [(shortsList: ShortId[]) => void, () => void]
>([
  () => {
    throw new Error("useShortsModal must be used within a ShortsModalContext");
  },
  () => {
    throw new Error("useShortsModal must be used within a ShortsModalContext");
  },
] as const);

export function ShortsModalProvider(props: PropsWithChildren<{}>) {
  const [shortsList, setShortsList] = useState<Array<ShortId>>([]);
  const [currIndex, setCurrIndex] = useState<number>(0);
  const [saveData, { markTutorialShortSeen }] = useSaveData();

  const currShortId = useCallback(
    () => shortsList[currIndex],
    [currIndex, shortsList]
  );

  const currShort = useCallback(() => SHORTS[currShortId()], [currShortId]);

  const shouldShowModal = useCallback(() => {
    // eslint-disable-next-line no-restricted-syntax
    for (const shortId of shortsList) {
      if (!saveData.seenTutorialShorts.includes(shortId)) {
        return true;
      }
    }
    return false;
  }, [saveData.seenTutorialShorts, shortsList]);

  const showShortsModal = useCallback((shorts: ShortId[]) => {
    setShortsList(shorts);
  }, []);

  const hideShortsModal = useCallback(() => {
    setShortsList([]);
    setCurrIndex(0);
  }, []);

  const markAllShortsAsSeen = useCallback(() => {
    shortsList.forEach((shortId) => {
      markTutorialShortSeen(shortId);
    });
  }, [markTutorialShortSeen, shortsList]);

  const nextShort = useCallback(() => {
    if (currIndex === shortsList.length - 1) {
      markAllShortsAsSeen();
      hideShortsModal();
      return;
    }
    setCurrIndex(currIndex + 1);
  }, [currIndex, hideShortsModal, markAllShortsAsSeen, shortsList.length]);

  const previousShort = useCallback(() => {
    if (currIndex === 0) {
      return;
    }
    setCurrIndex(currIndex - 1);
  }, [currIndex]);

  const providerValue = useMemo(
    () => [showShortsModal, hideShortsModal] as const,
    [showShortsModal, hideShortsModal]
  );

  return (
    <ShortsModalContext.Provider value={providerValue}>
      {shouldShowModal() && (
        <Modal
          isOpen
          autoFocus={false}
          onClose={markAllShortsAsSeen}
          closeOnEsc={false}
          closeOnOverlayClick={false}
        >
          <ModalOverlay />
          <ModalContent
            minW="container.md"
            top={{
              base: "0px",
              "2xl": "24px",
            }}
            py="24px"
            px="12px"
            position="fixed"
          >
            <ModalBody>
              <Text fontSize="2xl" fontWeight="bold">
                {currShort().title}
              </Text>
              <Text fontSize="lg">{currShort().text}</Text>
              <Box
                border="1px solid gray"
                my="20px"
                mx="auto"
                width="fit-content"
              >
                <Image maxH="300px" src={currShort().imageUrl} />
              </Box>
            </ModalBody>
            <Box w="100%">
              <Stack
                direction="row"
                spacing={4}
                justify="center"
                align="center"
              >
                {shortsList.length > 1 && (
                  <Button
                    colorScheme="black"
                    w="96px"
                    variant="ghost"
                    onClick={previousShort}
                    disabled={currIndex === 0}
                  >
                    <GrFormPreviousLink />
                    Back
                  </Button>
                )}
                {shortsList.length > 1 &&
                  shortsList.map((id, i) => (
                    <Box
                      display="inline-block"
                      key={id}
                      width="8px"
                      height="8px"
                      borderRadius="4px"
                      backgroundColor={i === currIndex ? "blue.500" : "gray"}
                      margin="0 4px"
                    />
                  ))}{" "}
                <Button
                  colorScheme="black"
                  variant="ghost"
                  onClick={nextShort}
                  w="96px"
                >
                  {currIndex === shortsList.length - 1 ? "Done" : "Next"}
                  {currIndex === shortsList.length - 1 ? (
                    <MdCheck />
                  ) : (
                    <GrFormNextLink />
                  )}
                </Button>
              </Stack>
            </Box>
          </ModalContent>
        </Modal>
      )}
      {props.children}
    </ShortsModalContext.Provider>
  );
}
