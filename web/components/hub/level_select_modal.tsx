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
import React, { useCallback } from "react";
import { useRouter } from "react-router5";

import { useLevels } from "../../hooks/scenes_hooks";
import LevelLink from "./level_link";

interface LevelSelectModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}

export default function LevelSelectModal(props: LevelSelectModalProps) {
  const LEVELS = useLevels();
  const router = useRouter();

  const handleClose = useCallback(() => {
    props.setVisible(false);
    if (props.onClose) {
      props.onClose();
    }
  }, [props]);

  if (!props.visible) {
    return null;
  }

  return (
    <Box hidden={!props.visible}>
      <Modal
        isOpen={props.visible}
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
          <ModalBody id="level-select-modal-body" className="dark-scrollbar">
            <Box>
              {LEVELS.map((scene) => (
                <Box key={scene.name}>
                  <LevelLink
                    scene={scene}
                    key={router.buildPath(scene.routeName, scene.routeParams)}
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
  );
}
