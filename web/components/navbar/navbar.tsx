import {
  Container,
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Spacer,
  Button,
} from "@chakra-ui/react";
import { MdArrowForward, MdExpandMore } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

import { useCallback } from "react";
import { NAVBAR_HEIGHT } from "../../lib/constants";
import {
  getNextSceneFromRoute,
  getSceneFromRoute,
  SCENES,
} from "../../lib/scenes";
import { useSaveData } from "../../contexts/save_data";
import NavbarLink from "./navbar_link";
import SceneLink from "./scene_link";

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
    return true;
  }, [isLastScene, location.pathname, saveData]);

  return (
    <Box bg="gray.800" textColor="white">
      <Container maxW="container.xl" p={2} height={`${NAVBAR_HEIGHT}px`}>
        <Flex height="100%" align="center">
          <NavbarLink to="/home" name="Home" />
          <Menu>
            <MenuButton
              cursor="pointer"
              fontWeight="bold"
              minW="max"
              mr={4}
              p={1}
              px={4}
              rounded="lg"
              color="gray.300"
              background="gray.800"
              _hover={{ background: "var(--chakra-colors-gray-700)" }}
            >
              <Box as="span" display="inline-flex">
                Scenes
                <MdExpandMore size="1.3em" style={{ marginTop: "0.2rem" }} />
              </Box>
            </MenuButton>
            <MenuList
              background="gray.700"
              borderColor="black"
              shadow="dark-lg"
            >
              {SCENES.map((scene) => (
                <SceneLink scene={scene} key={scene.route} />
              ))}
            </MenuList>
          </Menu>
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
