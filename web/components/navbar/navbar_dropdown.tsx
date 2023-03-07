import { Box, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import { useMemo } from "react";
import { MdExpandMore } from "react-icons/md";
import { useRouter } from "react-router5";

import { LevelState, useSaveData } from "../../contexts/save_data";
import { Scene, SCENES } from "../../lib/scenes";
import SceneLink from "./scene_link";

export interface NavbarDropdownProps {
  name: string;
  scenes: Scene[];
}

// Returns the *scene index* of the latest uncompleted level, or the last
// level index if all levels have been completed.
function getLatestUncompletedLevelIndex(
  levelStates: Record<string, LevelState>
) {
  for (let i = 0; i < SCENES.length; i += 1) {
    const scene = SCENES[i];
    if (scene.type === "level") {
      const levelName = scene.level?.short_name;
      const levelState = levelStates[levelName as string];
      if (levelState == null || !levelState.completed) {
        return i;
      }
    }
  }
  return SCENES.length - 1;
}

// Returns a list of booleans, where the ith element is true if the ith
// scene is locked.
function getLockedSceneIndexes(
  scenes: Scene[],
  levelStates: Record<string, LevelState>
): boolean[] {
  // The cutoff is the index of the latest uncompleted level.
  // Everything after the cutoff is locked.
  const cutoff = getLatestUncompletedLevelIndex(levelStates);
  // We also need to look up the index of each scene in the SCENES array.
  const trueIndexes = scenes.map((scene) => {
    const trueIndex = SCENES.indexOf(scene);
    if (trueIndex === -1) {
      throw new Error("Invalid scene");
    }
    return trueIndex;
  });
  return trueIndexes.map((trueIndex) => trueIndex > cutoff);
}

export default function NavbarDropdown(props: NavbarDropdownProps) {
  const router = useRouter();
  const [saveData, _] = useSaveData();

  const lockedSceneIndexes = useMemo(() => {
    const result = getLockedSceneIndexes(props.scenes, saveData.levelStates);
    return result;
  }, [props.scenes, saveData.levelStates]);

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
        {props.scenes.map((scene, index) => (
          <SceneLink
            scene={scene}
            key={router.buildPath(scene.routeName, scene.routeParams)}
            isLocked={lockedSceneIndexes[index]}
          />
        ))}
      </MenuList>
    </Menu>
  );
}
