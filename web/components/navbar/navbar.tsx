import { useRouteNode, useRouter } from "react-router5";
import { Container, Box, Flex, Spacer, Button } from "@chakra-ui/react";
import { MdArrowForward, MdSettings } from "react-icons/md";
import { useCallback, useState } from "react";

import { NAVBAR_HEIGHT } from "../../lib/constants";
import {
  useCurrScene,
  useJournalPages,
  useLevels,
  useSceneNavigator,
} from "../../contexts/scenes";
import { useSaveData } from "../../contexts/save_data";
import NavbarLink from "./navbar_link";
import NavbarDropdown from "./navbar_dropdown";
import SettingsModal from "./settings_modal";

export default function Navbar() {
  const router = useRouter();
  const { route } = useRouteNode("");
  const [saveData, _] = useSaveData();
  const currScene = useCurrScene();
  const JOURNAL_PAGES = useJournalPages();
  const LEVELS = useLevels();
  const { navigateToNextScene } = useSceneNavigator();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const isLastScene = useCallback(
    () => currScene?.nextScene == null,
    [currScene]
  );

  const isHome = useCallback(() => route.name === "home", [route.name]);

  const onNextClick = useCallback(() => {
    if (isLastScene()) {
      router.navigate("end");
    } else {
      navigateToNextScene();
    }
  }, [isLastScene, navigateToNextScene, router]);

  const shouldRenderNextButton = useCallback(() => {
    if (isHome() || !currScene) {
      return false;
    }
    if (currScene.type === "level") {
      const levelName = currScene.level?.short_name;
      return saveData.levelStates[levelName as string]?.completed;
    }
    return false;
  }, [currScene, isHome, saveData.levelStates]);

  return (
    <>
      <SettingsModal
        visible={settingsVisible}
        setVisible={setSettingsVisible}
      />
      <Box bg="gray.800" textColor="white">
        <Container maxW="container.xl" p={2} height={`${NAVBAR_HEIGHT}px`}>
          <Flex height="100%" align="center">
            <NavbarLink routeName="home" text="Home" />
            <Button
              mr="18px"
              background="none"
              fontWeight="bold"
              color="gray.300"
              _hover={{
                background: "var(--chakra-colors-gray-700)",
              }}
              _active={{
                background: "var(--chakra-colors-gray-700)",
              }}
              onClick={() => setSettingsVisible(true)}
            >
              <MdSettings size="0.9em" style={{ marginRight: "0.2rem" }} />
              Settings
            </Button>
            <NavbarDropdown name="Journal" scenes={JOURNAL_PAGES} />
            <NavbarDropdown name="Levels" scenes={LEVELS} />

            <Spacer />
            {shouldRenderNextButton() && (
              <Button colorScheme="blue" onClick={onNextClick}>
                Next
                <MdArrowForward size="1.3em" style={{ marginLeft: "0.2rem" }} />
              </Button>
            )}
          </Flex>
        </Container>
      </Box>
    </>
  );
}
