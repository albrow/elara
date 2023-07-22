import { Box, Button, Container, Flex, Text } from "@chakra-ui/react";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "react-router5";
import {
  MdPlayCircle,
  MdSave,
  MdSettings,
  MdOutlineHelp,
} from "react-icons/md";

import { useSaveData } from "../hooks/save_data_hooks";
import SettingsModal from "../components/settings/navbar/settings_modal";
import ConfirmNewGameModal from "../components/title/confirm_new_game_modal";
import { humanFriendlyTimestamp } from "../lib/utils";
import staryBgImg from "../images/starry_bg.webp";
import { useSceneNavigator } from "../hooks/scenes_hooks";

export default function Title() {
  const [saveData, { resetAllSaveData }] = useSaveData();
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [confirmNewGameVisible, setConfirmNewGameVisible] = useState(false);
  const { navigateToHub } = useSceneNavigator();

  const hasExistingSave = useMemo(
    () =>
      saveData.seenDialogTrees.length > 0 ||
      Object.values(saveData.levelStates).length > 0 ||
      saveData.seenJournalPages.length > 0,
    [saveData]
  );

  const handleNewGameConfirm = useCallback(() => {
    resetAllSaveData();
    navigateToHub();
  }, [navigateToHub, resetAllSaveData]);

  const handleNewGame = useCallback(() => {
    if (hasExistingSave) {
      setConfirmNewGameVisible(true);
    } else {
      handleNewGameConfirm();
    }
  }, [hasExistingSave, handleNewGameConfirm]);

  const handleContinue = useCallback(() => {
    navigateToHub();
  }, [navigateToHub]);

  const handleSettings = useCallback(() => {
    setSettingsVisible(true);
  }, []);

  const handleAbout = useCallback(() => {
    router.navigate("about");
  }, [router]);

  return (
    <Box
      w="100%"
      h="100%"
      bg="black"
      bgImage={staryBgImg}
      bgSize="cover"
      position="fixed"
    >
      <SettingsModal
        visible={settingsVisible}
        setVisible={setSettingsVisible}
      />
      <ConfirmNewGameModal
        visible={confirmNewGameVisible}
        setVisible={setConfirmNewGameVisible}
        onConfirm={handleNewGameConfirm}
      />
      <Container
        maxW="container.md"
        position="relative"
        top="30%"
        transform="translateY(-30%)"
      >
        <Text fontSize="5em" color="white" textAlign="center">
          Elara
        </Text>
        <Flex
          direction="column"
          maxW="fit-content"
          minW="240px"
          mx="auto"
          my="20px"
          gap="10px"
        >
          {hasExistingSave && (
            <Box minW="fit-content" mb="10px">
              <Button w="100%" size="lg" onClick={handleContinue}>
                <MdPlayCircle style={{ marginRight: "0.2em" }} />
                Continue
              </Button>
              {saveData.lastUpdated && (
                <Text
                  mt="1px"
                  fontStyle="italic"
                  fontSize="0.9em"
                  color="white"
                  textAlign="center"
                >
                  Last saved: {humanFriendlyTimestamp(saveData.lastUpdated)}
                </Text>
              )}
            </Box>
          )}
          <Button size="lg" onClick={handleNewGame}>
            <MdSave style={{ marginRight: "0.2em" }} />
            New Game
          </Button>
          <Button size="lg" onClick={handleSettings}>
            <MdSettings style={{ marginRight: "0.2em" }} />
            Settings
          </Button>
          <Button size="lg" onClick={handleAbout}>
            <MdOutlineHelp style={{ marginRight: "0.3em" }} />
            About
          </Button>
        </Flex>
      </Container>
      <Text
        position="fixed"
        fontSize="1em"
        color="white"
        bottom="10px"
        right="10px"
      >
        (early alpha version)
      </Text>
    </Box>
  );
}
