import { Outlet, useLocation, Navigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { MdExpandMore } from "react-icons/md";

import NavbarLink from "../components/navbar_link";
import NavbarDropdownLink from "../components/navbar_dropdown_link";

export default function Root() {
  let location = useLocation();

  if (location.pathname == "/") {
    // This seems to be necessary because of how child routes
    // work in React Router v6. We can't simply display the content
    // of Home.tsx inside of Root.tsx, because that would result in the
    // content being displayed on *every* child route, which is not what
    // we want.
    //
    // So instead, we make it so Root.tsx contains *just* the nav bar
    // then we automatically redirect to /home if you try to visit /
    // directly.
    return <Navigate to="/home" />;
  }

  return (
    <Container minW="container.md" maxW="none" p={0}>
      <Box bg="gray.800" p={2} textColor="white">
        <Container maxW="container.xl" height="40px">
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
                  <MdExpandMore
                    size={"1.3em"}
                    style={{ marginTop: "0.2rem" }}
                  />
                </Box>
              </MenuButton>
              <MenuList
                background="gray.700"
                borderColor="black"
                shadow="dark-lg"
              >
                <NavbarDropdownLink to="/level/0" name="Level 0" />
                <NavbarDropdownLink to="/level/1" name="Level 1" />
                <NavbarDropdownLink to="/level/2" name="Level 2" />
                <NavbarDropdownLink to="/level/3" name="Level 3" />
                <NavbarDropdownLink to="/level/4" name="Level 4" />
                <NavbarDropdownLink to="/level/5" name="Level 5" />
                <NavbarDropdownLink to="/level/6" name="Level 6" />
              </MenuList>
            </Menu>
          </Flex>
        </Container>
      </Box>
      <Outlet />
    </Container>
  );
}
