import {
  Container,
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Text,
  Spacer,
  Button,
} from "@chakra-ui/react";
import { MdArrowForward, MdExpandMore } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

import { useCallback } from "react";
import { NAVBAR_HEIGHT } from "../../lib/constants";
// eslint-disable-next-line camelcase
import { getNextSceneFromRoute, SCENES } from "../../lib/scenes";
import NavbarLink from "./navbar_link";
import NavbarDropdownLink from "./navbar_dropdown_link";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navigateToNextScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(location.pathname);
    if (nextScene == null) {
      throw new Error("Invalid route");
    }
    navigate(nextScene.route);
  }, [location, navigate]);

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
                <NavbarDropdownLink to={scene.route} key={scene.route}>
                  <Text as="span" ml={1}>
                    {scene.name}
                  </Text>
                </NavbarDropdownLink>
              ))}
            </MenuList>
          </Menu>
          <Spacer />
          {location.pathname !== SCENES[SCENES.length - 1].route && (
            <Button colorScheme="whiteAlpha" onClick={navigateToNextScene}>
              Next
              <MdArrowForward size="1.3em" style={{ marginLeft: "0.2rem" }} />
            </Button>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
