import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
  ModalCloseButton,
  ModalHeader,
  Text,
} from "@chakra-ui/react";
import React, {
  createContext,
  PropsWithChildren,
  useMemo,
  useState,
  useCallback,
} from "react";

import { useRouter } from "react-router5";
import { useLevels } from "../hooks/scenes_hooks";
import LevelLink from "../components/level_link";

/**
 * Provider for a modal that displays a list of levels that the user can choose
 * from.
 *
 * The context is an array that consists of one function, showLevelSelectModal.
 * This function can be called to show the modal.
 */
export const LevelSelectModalContext = createContext<readonly [() => void]>([
  () => {
    throw new Error(
      "useLevelSelectModal must be used within a LevelSelectModalContext"
    );
  },
] as const);

export function LevelSelectModalProvider(props: PropsWithChildren<{}>) {
  const LEVELS = useLevels();
  const router = useRouter();

  const [visible, setVisible] = useState<boolean>(false);

  const showLevelSelectModal = useCallback(() => {
    setVisible(true);
  }, []);

  const providerValue = useMemo(
    () => [showLevelSelectModal] as const,
    [showLevelSelectModal]
  );

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <LevelSelectModalContext.Provider value={providerValue}>
      {visible && (
        <Box hidden={!visible}>
          <Modal
            isOpen={visible}
            onClose={handleClose}
            size="sm"
            scrollBehavior="inside"
            preserveScrollBarGap
            motionPreset="slideInBottom"
          >
            <ModalOverlay />
            <ModalContent bg="gray.800" color="white" border="1px solid black">
              <ModalHeader>
                <Text
                  fontSize="24px"
                  fontWeight="bold"
                  mt="2px"
                  mb="2px"
                  align="center"
                >
                  Choose Level
                </Text>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody
                id="level-select-modal-body"
                className="dark-scrollbar"
              >
                <Box>
                  {LEVELS.map((scene) => (
                    <Box key={scene.name}>
                      <LevelLink
                        scene={scene}
                        key={router.buildPath(
                          scene.routeName,
                          scene.routeParams
                        )}
                        isLocked={!scene.unlocked}
                        onClick={() => {
                          if (scene.unlocked) handleClose();
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>
      )}
      {props.children}
    </LevelSelectModalContext.Provider>
  );
}
