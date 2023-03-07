import { useRouteNode } from "react-router5";
import { Container, Box, Flex, Spacer, Button } from "@chakra-ui/react";
import { MdArrowForward } from "react-icons/md";
import { useCallback } from "react";

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

export default function Navbar() {
  const { route } = useRouteNode("");
  const [saveData, _] = useSaveData();
  const currScene = useCurrScene();
  const JOURNAL_PAGES = useJournalPages();
  const LEVELS = useLevels();
  const { navigateToNextScene } = useSceneNavigator();

  const isLastScene = useCallback(
    () => currScene?.nextScene == null,
    [currScene]
  );

  const isHome = useCallback(() => route.name === "home", [route.name]);

  const shouldRenderNextButton = useCallback(() => {
    if (isHome() || isLastScene() || !currScene) {
      return false;
    }
    if (currScene.type === "level") {
      const levelName = currScene.level?.short_name;
      return saveData.levelStates[levelName as string]?.completed;
    }
    return false;
  }, [currScene, isHome, isLastScene, saveData.levelStates]);

  return (
    <Box bg="gray.800" textColor="white">
      <Container maxW="container.xl" p={2} height={`${NAVBAR_HEIGHT}px`}>
        <Flex height="100%" align="center">
          <NavbarLink routeName="home" text="Home" />
          <NavbarDropdown name="Journal" scenes={JOURNAL_PAGES} />
          <NavbarDropdown name="Levels" scenes={LEVELS} />
          <Spacer />
          {shouldRenderNextButton() && (
            <Button colorScheme="blue" onClick={navigateToNextScene}>
              Next
              <MdArrowForward size="1.3em" style={{ marginLeft: "0.2rem" }} />
            </Button>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
