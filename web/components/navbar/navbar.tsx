import {
  Container,
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { MdExpandMore } from "react-icons/md";

import { NAVBAR_HEIGHT } from "../../lib/constants";

// eslint-disable-next-line camelcase
import { LEVELS } from "../../lib/scenes";
import NavbarLink from "./navbar_link";
import NavbarDropdownLink from "./navbar_dropdown_link";

export default function Navbar() {
  return (
    <Box bg="gray.800" textColor="white">
      <Container maxW="container.xl" p={2} height={`${NAVBAR_HEIGHT}px`}>
        <Flex height="100%" align="center">
          <NavbarLink to="/home" name="Home" />
          <NavbarLink to="/journal" name="Journal" />
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
                {" "}
                Levels
                <MdExpandMore size="1.3em" style={{ marginTop: "0.2rem" }} />
              </Box>
            </MenuButton>
            <MenuList
              background="gray.700"
              borderColor="black"
              shadow="dark-lg"
            >
              {LEVELS.map((level, i) => (
                <NavbarDropdownLink to={`/level/${i}`} key={level.name}>
                  <Text
                    as="span"
                    fontFamily="monospace"
                    fontSize="md"
                    fontWeight="bold"
                  >
                    {i}:
                  </Text>
                  <Text as="span" ml={1}>
                    {level.name}
                  </Text>
                </NavbarDropdownLink>
              ))}
            </MenuList>
          </Menu>
        </Flex>
      </Container>
    </Box>
  );
}
