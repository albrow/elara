import { Container, Box, Flex, Spacer, Button } from "@chakra-ui/react";
import { MdArrowForward } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

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
  const location = useLocation();
  const navigate = useNavigate();
  const [saveData, _] = useSaveData();

  const navigateToNextScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(location.pathname);
    if (nextScene == null) {
      throw new Error("Invalid route");
    }
    navigate(nextScene.route);
  }, [location, navigate]);

  const isLastScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(location.pathname);
    return nextScene == null;
  }, [location.pathname]);

  const isHome = useCallback(
    () => location.pathname === "/home",
    [location.pathname]
  );

  const shouldRenderNextButton = useCallback(() => {
    if (isLastScene()) {
      return false;
    }
    const currScene = getSceneFromRoute(location.pathname);
    if (currScene == null) {
      // E.g. this can happen if we're on the home screen.
      return true;
    }
    if (currScene.type === "level") {
      const levelName = currScene.level?.short_name;
      return saveData.levelStates[levelName as string]?.completed;
    }
    return false;
  }, [isLastScene, location.pathname, saveData]);

  return (
    <Box bg="gray.800" textColor="white">
      <Container maxW="container.xl" p={2} height={`${NAVBAR_HEIGHT}px`}>
        <Flex height="100%" align="center">
          <NavbarLink to="/home" name="Home" />
          <NavbarDropdown name="Journal" scenes={JOURNAL_PAGES} />
          <NavbarDropdown name="Levels" scenes={LEVELS} />
          <Spacer />
          {shouldRenderNextButton() && (
            <Button colorScheme="whiteAlpha" onClick={navigateToNextScene}>
              {isHome() ? "Start" : "Next"}
              <MdArrowForward size="1.3em" style={{ marginLeft: "0.2rem" }} />
            </Button>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
