import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import debounce from "lodash.debounce";

import { MdExitToApp } from "react-icons/md";
import { useRouteNode } from "react-router5";
import { useSaveData } from "../../../hooks/save_data_hooks";
import { useSceneNavigator } from "../../../hooks/scenes_hooks";
import VolumeSlider from "./volume_slider";

export interface SettingsModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SettingsModal(props: SettingsModalProps) {
  const [
    saveData,
    {
      saveMasterVolume,
      saveSoundEffectsVolume,
      saveDialogVolume,
      saveMusicVolume,
    },
  ] = useSaveData();
  const { route } = useRouteNode("");
  const { navigateToTitle } = useSceneNavigator();

  const masterVolume = useMemo(
    () => saveData.settings.masterVolume,
    [saveData.settings.masterVolume]
  );
  const setMasterVolume = debounce(
    useCallback(
      (percentValue: number) => {
        saveMasterVolume(percentValue / 100);
      },
      [saveMasterVolume]
    ),
    100,
    { maxWait: 1000 }
  );

  const soundEffectsVolume = useMemo(
    () => saveData.settings.soundEffectsVolume,
    [saveData.settings.soundEffectsVolume]
  );
  const setSoundEffectsVolume = debounce(
    useCallback(
      (percentValue: number) => {
        saveSoundEffectsVolume(percentValue / 100);
      },
      [saveSoundEffectsVolume]
    ),
    100,
    { maxWait: 1000 }
  );

  const dialogVolume = useMemo(
    () => saveData.settings.dialogVolume,
    [saveData.settings.dialogVolume]
  );
  const setDialogVolume = debounce(
    useCallback(
      (percentValue: number) => {
        saveDialogVolume(percentValue / 100);
      },
      [saveDialogVolume]
    ),
    100,
    { maxWait: 1000 }
  );

  const musicVolume = useMemo(
    () => saveData.settings.musicVolume,
    [saveData.settings.musicVolume]
  );
  const setMusicVolume = debounce(
    useCallback(
      (percentValue: number) => {
        saveMusicVolume(percentValue / 100);
      },
      [saveMusicVolume]
    ),
    100,
    { maxWait: 1000 }
  );

  return (
    <Modal
      isOpen={props.visible}
      onClose={() => props.setVisible(false)}
      autoFocus={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontWeight="bold">Settings</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box pb="10px">
            <Text fontWeight="bold">Overall volume</Text>
            <VolumeSlider
              initialValPercent={masterVolume * 100}
              onChange={setMasterVolume}
            />
            <Text fontWeight="bold">Sound effects volume</Text>
            <VolumeSlider
              initialValPercent={soundEffectsVolume * 100}
              onChange={setSoundEffectsVolume}
            />
            <Text fontWeight="bold">Dialog volume</Text>
            <VolumeSlider
              initialValPercent={dialogVolume * 100}
              onChange={setDialogVolume}
            />
            <Text fontWeight="bold">Music volume</Text>
            <VolumeSlider
              initialValPercent={musicVolume * 100}
              onChange={setMusicVolume}
            />
          </Box>
          {route.name !== "title" && (
            <Flex w="100%" mt="20px" mb="10px" gap="5px" justifyContent="right">
              <Button colorScheme="blackAlpha" onClick={navigateToTitle}>
                <MdExitToApp style={{ marginRight: "0.3em" }} />
                Exit to Title Screen
              </Button>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
