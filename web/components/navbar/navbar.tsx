import { useRouteNode, useRouter } from "react-router5";
import { Container, Box, Flex, Spacer, Button } from "@chakra-ui/react";
import { MdArrowForward } from "react-icons/md";
import { useCallback } from "react";

import { NAVBAR_HEIGHT } from "../../lib/constants";
import {
  getNextSceneFromRoute,
  getSceneFromRoute,
  JOURNAL_PAGES,
  LEVELS,
} from "../../lib/scenes";
import { useSaveData } from "../../contexts/save_data";
import NavbarLink from "./navbar_link";
import NavbarDropdown from "./navbar_dropdown";

export default function Navbar() {
  const router = useRouter();
  const { route } = useRouteNode("");
  const [saveData, _] = useSaveData();

  const navigateToNextScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(route);
    if (nextScene == null) {
      throw new Error("Invalid route");
    }
    router.navigate(nextScene.routeName, nextScene.routeParams ?? {});
  }, [route, router]);

  const isLastScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(route);
    return nextScene == null;
  }, [route]);

  const isHome = useCallback(() => route.name === "home", [route.name]);

  const shouldRenderNextButton = useCallback(() => {
    if (isLastScene() || isHome()) {
      return false;
    }
    const currScene = getSceneFromRoute(route);
    if (currScene == null) {
      // E.g. this can happen if we're on the home screen.
      return true;
    }
    if (currScene.type === "level") {
      const levelName = currScene.level?.short_name;
      return saveData.levelStates[levelName as string]?.completed;
    }
    return false;
  }, [isHome, isLastScene, route, saveData.levelStates]);

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
