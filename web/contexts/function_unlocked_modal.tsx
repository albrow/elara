import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
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

import { docPages } from "../components/editor/text_effects";
import { useSaveData } from "../hooks/save_data_hooks";

export const FunctionUnlockedModalContext = createContext<
  readonly [(functions: string[]) => void, () => void]
>([
  () => {
    throw new Error(
      "useFunctionUnlockedModal must be used within a FunctionUnlockedModalContext"
    );
  },
  () => {
    throw new Error(
      "useFunctionUnlockedModal must be used within a FunctionUnlockedModalContext"
    );
  },
] as const);

export function FunctionUnlockedModalProvider(props: PropsWithChildren<{}>) {
  const [functionsToUnlock, setFunctionsToUnlock] = useState<Array<string>>([]);
  const [currIndex, setCurrIndex] = useState<number>(0);
  const [saveData, { unlockFunctions }] = useSaveData();

  const currFuncName = useMemo(
    () => functionsToUnlock[currIndex],
    [currIndex, functionsToUnlock]
  );

  const FunctionPage = useMemo(() => {
    if (functionsToUnlock.length === 0) {
      return null;
    }
    if (!docPages[currFuncName as keyof typeof docPages]) {
      throw new Error(`No documentation page for ${currFuncName}`);
    }
    return docPages[currFuncName as keyof typeof docPages];
  }, [currFuncName, functionsToUnlock.length]);

  const shouldShowModal = useCallback(() => {
    if (functionsToUnlock.length === 0) {
      return false;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const functionName of functionsToUnlock) {
      if (!saveData.unlockedFunctions.includes(functionName)) {
        return true;
      }
    }
    return false;
  }, [saveData.unlockedFunctions, functionsToUnlock]);

  const showFunctionUnlockedModal = useCallback((functions: string[]) => {
    setFunctionsToUnlock(functions);
  }, []);

  const hideFunctionUnlockedModal = useCallback(() => {
    setFunctionsToUnlock([]);
    setCurrIndex(0);
  }, []);

  const markAllFunctionsAsUnlocked = useCallback(() => {
    unlockFunctions(functionsToUnlock);
    hideFunctionUnlockedModal();
  }, [unlockFunctions, functionsToUnlock, hideFunctionUnlockedModal]);

  const nextFunction = useCallback(() => {
    if (currIndex === functionsToUnlock.length - 1) {
      markAllFunctionsAsUnlocked();
      hideFunctionUnlockedModal();
      return;
    }
    setCurrIndex(currIndex + 1);
  }, [
    currIndex,
    hideFunctionUnlockedModal,
    markAllFunctionsAsUnlocked,
    functionsToUnlock.length,
  ]);

  const previousFunction = useCallback(() => {
    if (currIndex === 0) {
      return;
    }
    setCurrIndex(currIndex - 1);
  }, [currIndex]);

  const providerValue = useMemo(
    () => [showFunctionUnlockedModal, hideFunctionUnlockedModal] as const,
    [showFunctionUnlockedModal, hideFunctionUnlockedModal]
  );

  return (
    <FunctionUnlockedModalContext.Provider value={providerValue}>
      {shouldShowModal() && FunctionPage !== null && (
        <Modal
          isOpen
          autoFocus={false}
          onClose={markAllFunctionsAsUnlocked}
          closeOnEsc={false}
          closeOnOverlayClick={false}
        >
          <ModalOverlay />
          <ModalContent
            minW="container.sm"
            top={{
              base: "0px",
              "2xl": "24px",
            }}
            py="24px"
            px="12px"
            position="fixed"
          >
            <ModalBody>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                New Function Unlocked!
              </Text>
              <Box
                className="md-content function-unlocked-modal"
                mt="24px"
                mb="12px"
                mx="auto"
                py="12px"
                px="24px"
                bg="gray.200"
                width="100%"
                border="1px solid"
                color="black"
                userSelect="text"
                _hover={{ cursor: "text" }}
              >
                <FunctionPage />
              </Box>
              <Text fontSize="lg" />
            </ModalBody>
            <Box w="100%">
              <Stack
                direction="row"
                spacing={4}
                justify="center"
                align="center"
              >
                {functionsToUnlock.length > 1 && (
                  <Button
                    colorScheme="black"
                    w="96px"
                    variant="ghost"
                    onClick={previousFunction}
                    disabled={currIndex === 0}
                  >
                    <GrFormPreviousLink />
                    Back
                  </Button>
                )}
                {functionsToUnlock.length > 1 &&
                  functionsToUnlock.map((id, i) => (
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
                  onClick={nextFunction}
                  w="96px"
                >
                  {currIndex === functionsToUnlock.length - 1 ? "Done" : "Next"}
                  {currIndex === functionsToUnlock.length - 1 ? (
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
    </FunctionUnlockedModalContext.Provider>
  );
}
