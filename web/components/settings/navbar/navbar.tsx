import { Box } from "@chakra-ui/react";
import { MdHome, MdSettings } from "react-icons/md";
import { FaBullhorn } from "react-icons/fa";
import { useState } from "react";

import { NAVBAR_Z_INDEX } from "../../../lib/constants";
import { NAVBAR_RESPONSIVE_HEIGHT } from "../../../lib/responsive_design";
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
        height={NAVBAR_RESPONSIVE_HEIGHT}
        bg="gray.800"
        textColor="white"
        position="fixed"
        zIndex={NAVBAR_Z_INDEX}
        top="0"
        p={{
          base: 2,
          // "2xl": 3,
          // "3xl": 4,
        }}
      >
        <NavbarButton
          onClick={() => {
            setSettingsVisible(false);
            navigateToHub();
          }}
        >
          <MdHome size="0.9em" style={{ marginRight: "0.2rem" }} />
          Hub
        </NavbarButton>
        <NavbarButton onClick={() => setSettingsVisible(!settingsVisible)}>
          <MdSettings size="0.9em" style={{ marginRight: "0.2rem" }} />
          Settings
        </NavbarButton>
        <a
          href="https://forms.gle/PZkMf5LkPwLunfNu7"
          target="_blank"
          rel="noreferrer"
        >
          <NavbarButton onClick={() => setSettingsVisible(false)}>
            <FaBullhorn size="0.9em" style={{ marginRight: "0.3rem" }} />
            Feedback
          </NavbarButton>
        </a>
      </Box>
    </>
  );
}
