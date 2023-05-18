import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";

import { useSaveData, updateSettings } from "../../contexts/save_data";
import VolumeSlider from "./volume_slider";

export interface SettingsModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SettingsModal(props: SettingsModalProps) {
  const [saveData, setSaveData] = useSaveData();

  const masterVolume = useMemo(
    () => saveData.settings.masterVolume,
    [saveData.settings.masterVolume]
  );
  const setMasterVolume = useCallback(
    (percentValue: number) => {
      const newSaveData = updateSettings(saveData, {
        ...saveData.settings,
        masterVolume: percentValue / 100,
      });
      setSaveData(newSaveData);
    },
    [saveData, setSaveData]
  );

  const soundEffectsVolume = useMemo(
    () => saveData.settings.soundEffectsVolume,
    [saveData.settings.soundEffectsVolume]
  );
  const setSoundEffectsVolume = useCallback(
    (percentValue: number) => {
      const newSaveData = updateSettings(saveData, {
        ...saveData.settings,
        soundEffectsVolume: percentValue / 100,
      });
      setSaveData(newSaveData);
    },
    [saveData, setSaveData]
  );

  return (
    <Modal isOpen={props.visible} onClose={() => props.setVisible(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontWeight="bold">Settings</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box pb="10px">
            <Text fontWeight="bold">Master volume</Text>
            <VolumeSlider
              initialValPercent={masterVolume * 100}
              onChange={setMasterVolume}
            />
            <Text fontWeight="bold">Sound effects volume</Text>
            <VolumeSlider
              initialValPercent={soundEffectsVolume * 100}
              onChange={setSoundEffectsVolume}
            />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
