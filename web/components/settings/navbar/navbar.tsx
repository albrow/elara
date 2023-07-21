import { Box } from "@chakra-ui/react";
import { MdHome, MdSettings } from "react-icons/md";
import { useState } from "react";

import { NAVBAR_HEIGHT, NAVBAR_Z_INDEX } from "../../../lib/constants";
import { useSceneNavigator } from "../../../hooks/scenes_hooks";
import SettingsModal from "./settings_modal";
import NavbarButton from "./navbar_button";

export default function Navbar() {
  const { navigateToHub } = useSceneNavigator();
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <>
      <SettingsModal
        visible={settingsVisible}
        setVisible={setSettingsVisible}
      />
      <Box
        w="100%"
        height={`${NAVBAR_HEIGHT}px`}
        bg="gray.800"
        textColor="white"
        position="fixed"
        zIndex={NAVBAR_Z_INDEX}
        top="0"
        p={2}
      >
        <NavbarButton onClick={() => navigateToHub()}>
          <MdHome size="0.9em" style={{ marginRight: "0.2rem" }} />
          Hub
        </NavbarButton>
        <NavbarButton onClick={() => setSettingsVisible(true)}>
          <MdSettings size="0.9em" style={{ marginRight: "0.2rem" }} />
          Settings
        </NavbarButton>
      </Box>
    </>
  );
}
