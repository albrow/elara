import { Box, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import { MdExpandMore } from "react-icons/md";
import { useRouter } from "react-router5";

import { Scene } from "../../contexts/scenes";
import SceneLink from "./scene_link";

export interface NavbarDropdownProps {
  name: string;
  scenes: Scene[];
}

export default function NavbarDropdown(props: NavbarDropdownProps) {
  const router = useRouter();

  return (
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
          {props.name}
          <MdExpandMore size="1.3em" style={{ marginTop: "0.2rem" }} />
        </Box>
      </MenuButton>
      <MenuList background="gray.700" borderColor="black" shadow="dark-lg">
        {props.scenes.map((scene) => (
          <SceneLink
            scene={scene}
            key={router.buildPath(scene.routeName, scene.routeParams)}
            isLocked={!scene.unlocked}
          />
        ))}
      </MenuList>
    </Menu>
  );
}
