import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { MdExpandMore } from "react-icons/md";
import { useRouter } from "react-router5";
import chunk from "lodash.chunk";

import { useMemo, useState } from "react";
import { Scene } from "../../contexts/scenes";
import {
  NAVBAR_DROPDOWN_ITEMS_PER_COLUMN,
  NAVBAR_DROPDOWN_Z_INDEX,
  NAVBAR_HEIGHT,
} from "../../lib/constants";
import SceneLink from "./scene_link";

export interface NavbarDropdownProps {
  name: string;
  scenes: Scene[];
}

export default function NavbarDropdown(props: NavbarDropdownProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sceneColumns = useMemo(
    () => chunk(props.scenes, NAVBAR_DROPDOWN_ITEMS_PER_COLUMN),
    [props.scenes]
  );

  const delayedHide = () => {
    // Note(albrow): This is a workaround for a bug where navigation
    // would not trigger when clicking on a link in the navbar dropdown.
    // It seems to have something to do with the DOM ignoring events from
    // elements which are not visible, or maybe from React unmounting
    // components before the event can be processed.
    setTimeout(() => setIsMenuOpen(false), 150);
  };

  return (
    <Box position="relative" onBlur={delayedHide}>
      <Button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        cursor="pointer"
        fontWeight="bold"
        minW="max"
        h="max-content"
        rounded="lg"
        color="gray.300"
        background="gray.800"
        _hover={{ background: "var(--chakra-colors-gray-700)" }}
        _active={{ background: "var(--chakra-colors-gray-700)" }}
        px="14px"
        py="6px"
      >
        <Box as="span" display="inline-flex" alignItems="center">
          <Text as="span" verticalAlign="middle">
            {props.name}
          </Text>
          <MdExpandMore size="1.3em" style={{ marginTop: "0.2rem" }} />
        </Box>
      </Button>
      <Box
        hidden={!isMenuOpen}
        position="absolute"
        top={`${NAVBAR_HEIGHT - 10}px`}
        left="-8px"
        zIndex={NAVBAR_DROPDOWN_Z_INDEX}
        background="gray.700"
        borderColor="black"
        shadow="dark-lg"
        p="10px"
        w="max-content"
        rounded="lg"
      >
        <Flex direction="row">
          {sceneColumns.map((scenes, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Box key={`navbar_dropdown_column_${i}`}>
              {scenes.map((scene) => (
                <Box key={scene.name} mb="4px">
                  <SceneLink
                    scene={scene}
                    key={router.buildPath(scene.routeName, scene.routeParams)}
                    isLocked={!scene.unlocked}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}
