import { Box, Button, Container, Flex, Text } from "@chakra-ui/react";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "react-router5";
import { MdPlayCircle, MdSave, MdSettings } from "react-icons/md";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { NAVBAR_HEIGHT } from "../lib/constants";
import { useSaveData } from "../hooks/save_data_hooks";
import SettingsModal from "../components/settings/navbar/settings_modal";
import ConfirmNewGameModal from "../components/title/confirm_new_game_modal";

export default function Title() {
  const [saveData, { resetAllSaveData }] = useSaveData();
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [confirmNewGameVisible, setConfirmNewGameVisible] = useState(false);

  const hasExistingSave = useMemo(
    () =>
      saveData.seenDialogTrees.length > 0 ||
      Object.values(saveData.levelStates).length > 0 ||
      saveData.seenJournalPages.length > 0,
    [saveData]
  );

  const handleNewGameConfirm = useCallback(() => {
    resetAllSaveData();
    router.navigate("hub");
  }, [resetAllSaveData, router]);

  const handleNewGame = useCallback(() => {
    if (hasExistingSave) {
      setConfirmNewGameVisible(true);
    } else {
      handleNewGameConfirm();
    }
  }, [hasExistingSave, handleNewGameConfirm]);

  const handleContinue = useCallback(() => {
    router.navigate("hub");
  }, [router]);

  const handleSettings = useCallback(() => {
    setSettingsVisible(true);
  }, []);

  const handleAbout = useCallback(() => {
    router.navigate("about");
  }, [router]);

  return (
    <Box w="100%" h="100%" bg="black" position="fixed">
      <SettingsModal
        visible={settingsVisible}
        setVisible={setSettingsVisible}
      />
      <ConfirmNewGameModal
        visible={confirmNewGameVisible}
        setVisible={setConfirmNewGameVisible}
        onConfirm={handleNewGameConfirm}
      />
      <Container maxW="container.md" p={8} mt={`${NAVBAR_HEIGHT}px`}>
        <Text fontSize="5em" color="white" textAlign="center">
          Elara
        </Text>
        <Flex
          direction="column"
          maxW="fit-content"
          mx="auto"
          my="20px"
          gap="20px"
        >
          {hasExistingSave && (
            <Button size="lg" onClick={handleContinue}>
              <MdPlayCircle style={{ marginRight: "0.2em" }} />
              Continue
            </Button>
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
            <BsFillQuestionCircleFill
              size="0.9em"
              style={{ marginRight: "0.3em" }}
            />
            About
          </Button>
        </Flex>
      </Container>
    </Box>
  );
}
