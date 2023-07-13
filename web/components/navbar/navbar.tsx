import { Container, Box, Flex } from "@chakra-ui/react";
import { MdHome, MdSettings } from "react-icons/md";
import { useState } from "react";

import { NAVBAR_HEIGHT } from "../../lib/constants";
import { useJournalPages, useSceneNavigator } from "../../hooks/scenes_hooks";
import NavbarDropdown from "./navbar_dropdown";
import SettingsModal from "./settings_modal";
import NavbarButton from "./navbar_button";

export default function Navbar() {
  const JOURNAL_PAGES = useJournalPages();
  const { navigateToHub } = useSceneNavigator();
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <>
      <SettingsModal
        visible={settingsVisible}
        setVisible={setSettingsVisible}
      />
      <Box bg="gray.800" textColor="white">
        <Container maxW="container.xl" p={2} height={`${NAVBAR_HEIGHT}px`}>
          <Flex height="100%" align="center">
            <NavbarButton onClick={() => navigateToHub()}>
              <MdHome size="0.9em" style={{ marginRight: "0.2rem" }} />
              Hub
            </NavbarButton>
            <NavbarButton onClick={() => setSettingsVisible(true)}>
              <MdSettings size="0.9em" style={{ marginRight: "0.2rem" }} />
              Settings
            </NavbarButton>
            <NavbarDropdown name="Journal" scenes={JOURNAL_PAGES} />
          </Flex>
        </Container>
      </Box>
    </>
  );
}
