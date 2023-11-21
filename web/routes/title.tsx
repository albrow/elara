import { Box, Button, Container, Flex, Img, Text } from "@chakra-ui/react";

import { useCallback, useMemo, useState } from "react";
import {
  MdPlayCircle,
  MdSave,
  MdSettings,
  MdOutlineHelp,
  MdNewspaper,
  MdExitToApp,
} from "react-icons/md";

import { Animate } from "react-simple-animate";
import { useSaveData } from "../hooks/save_data_hooks";
import SettingsModal from "../components/settings/navbar/settings_modal";
import ConfirmDeleteDataModal from "../components/title/confirm_delete_data_modal";
import { humanFriendlyTimestamp } from "../lib/utils";
import staryBgImg from "../images/starry_bg.webp";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import logoImg from "../images/logo.webp";
import { NewGameModal } from "../components/title/new_game_modal";
import { ChangelogModal } from "../components/title/changelog_modal";

export default function Title() {
  const [saveData, { resetAllSaveData }] = useSaveData();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [confirmDeleteDataModalVisble, setConfirmDeleteDataModalVisible] =
    useState(false);
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);
  const [changelogModalVisible, setChangelogModalVisisble] = useState(false);
  const { navigateToHub, navigateToCutscene } = useSceneNavigator();

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

  const onChangelog = useCallback(() => {
    setChangelogModalVisisble(true);
  }, []);

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
      <ChangelogModal
        visible={changelogModalVisible}
        setVisible={setChangelogModalVisisble}
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
          <a href="https://elaragame.com" target="_blank" rel="noreferrer">
            <Button size="lg" w="100%">
              <MdOutlineHelp style={{ marginRight: "0.3em" }} />
              About
            </Button>
          </a>
          <Button size="lg" onClick={onChangelog}>
            <MdNewspaper style={{ marginRight: "0.2em" }} />
            What&apos;s New
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
        public beta version {APP_VERSION}
      </Text>
      {ELARA_BUILD_TARGET === "electron" && (
        // Show a quit button in the bottom left corner if we're running in Electron
        <Box position="fixed" bottom="10px" left="10px">
          <Button
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={() => window.close()}
          >
            {/* Horizontally flip the icon so it points in the right direction */}
            <MdExitToApp
              color="white"
              size="1.3em"
              style={{
                marginRight: "0.3em",
                transform: "scaleX(-1)",
              }}
            />
            <Text fontSize="1.2em" color="white" fontWeight={700}>
              Quit
            </Text>
          </Button>
        </Box>
      )}
    </Box>
  );
}
