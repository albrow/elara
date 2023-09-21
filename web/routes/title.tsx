import { Box, Button, Container, Flex, Img, Text } from "@chakra-ui/react";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "react-router5";
import {
  MdPlayCircle,
  MdSave,
  MdSettings,
  MdOutlineHelp,
} from "react-icons/md";

import { Animate } from "react-simple-animate";
import { useSaveData } from "../hooks/save_data_hooks";
import SettingsModal from "../components/settings/navbar/settings_modal";
import ConfirmDeleteDataModal from "../components/title/confirm_delete_data_modal";
import { humanFriendlyTimestamp } from "../lib/utils";
import staryBgImg from "../images/starry_bg.webp";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import logoImg from "../images/logo.webp";
import { useJukebox } from "../hooks/jukebox_hooks";
import { NewGameModal } from "../components/title/new_game_modal";

export default function Title() {
  const [saveData, { resetAllSaveData }] = useSaveData();
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [confirmDeleteDataModalVisble, setConfirmDeleteDataModalVisible] =
    useState(false);
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);
  const { navigateToHub, navigateToCutscene } = useSceneNavigator();
  const { stopAllMusic } = useJukebox();

  const hasExistingSave = useMemo(
    () =>
      saveData.seenDialogTrees.length > 0 ||
      Object.values(saveData.levelStates).length > 0 ||
      saveData.seenJournalPages.length > 0,
    [saveData]
  );

  const startNewGame = useCallback(() => {
    setNewGameModalVisible(false);
    navigateToCutscene("intro");
  }, [navigateToCutscene]);

  const onNewGame = useCallback(() => {
    if (hasExistingSave) {
      setConfirmDeleteDataModalVisible(true);
    } else {
      setNewGameModalVisible(true);
    }
  }, [
    hasExistingSave,
    setConfirmDeleteDataModalVisible,
    setNewGameModalVisible,
  ]);

  const onConfirmDeleteData = useCallback(() => {
    resetAllSaveData();
    setConfirmDeleteDataModalVisible(false);
    setNewGameModalVisible(true);
  }, [resetAllSaveData]);

  const onContinue = useCallback(() => {
    navigateToHub();
  }, [navigateToHub]);

  const onSettings = useCallback(() => {
    setSettingsVisible(true);
  }, []);

  const onAbout = useCallback(() => {
    stopAllMusic();
    router.navigate("about");
  }, [router, stopAllMusic]);

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
      <ConfirmDeleteDataModal
        visible={confirmDeleteDataModalVisble}
        setVisible={setConfirmDeleteDataModalVisible}
        onConfirm={onConfirmDeleteData}
      />
      <NewGameModal
        visible={newGameModalVisible}
        setVisible={setNewGameModalVisible}
        onProceed={startNewGame}
        onCancel={() => {
          setNewGameModalVisible(false);
        }}
      />
      <Container
        maxW="container.md"
        position="relative"
        top="25%"
        transform="translateY(-25%)"
      >
        <Animate
          start={{
            opacity: 0,
            transform: "translateY(-40%)",
          }}
          end={{
            opacity: 1,
            transform: "translateY(0)",
          }}
          play
          duration={3}
        >
          <Img src={logoImg} w="50%" mx="auto" />
        </Animate>
        <Flex
          direction="column"
          maxW="fit-content"
          minW="240px"
          mx="auto"
          mt="40px"
          mb="20px"
          gap="10px"
        >
          {hasExistingSave && (
            <Box minW="fit-content" mb="10px">
              <Button w="100%" size="lg" onClick={onContinue}>
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
          <Button size="lg" onClick={onNewGame}>
            <MdSave style={{ marginRight: "0.2em" }} />
            New Game
          </Button>
          <Button size="lg" onClick={onSettings}>
            <MdSettings style={{ marginRight: "0.2em" }} />
            Settings
          </Button>
          <Button size="lg" onClick={onAbout}>
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
