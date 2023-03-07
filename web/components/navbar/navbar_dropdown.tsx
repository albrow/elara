import { Box, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import { useMemo } from "react";
import { MdExpandMore } from "react-icons/md";
import { useRouter } from "react-router5";

import { LevelState, useSaveData } from "../../contexts/save_data";
import { SceneWithMeta, useScenes } from "../../contexts/scenes";
import SceneLink from "./scene_link";

export interface NavbarDropdownProps {
  name: string;
  scenes: SceneWithMeta[];
}

// Returns the *scene index* of the latest uncompleted level, or the last
// level index if all levels have been completed.
// TODO(albrow): Move this logic to the Scenes provider.
function getLatestUncompletedLevelIndex(
  allScenes: SceneWithMeta[],
  levelStates: Record<string, LevelState>
) {
  for (let i = 0; i < allScenes.length; i += 1) {
    const scene = allScenes[i];
    if (scene.type === "level") {
      const levelName = scene.level?.short_name;
      const levelState = levelStates[levelName as string];
      if (levelState == null || !levelState.completed) {
        return i;
      }
    }
  }
  return allScenes.length - 1;
}

// Returns a list of booleans, where the ith element is true if the ith
// scene is locked.
function getLockedSceneIndexes(
  allScenes: SceneWithMeta[],
  theseScenes: SceneWithMeta[],
  levelStates: Record<string, LevelState>
): boolean[] {
  // The cutoff is the index of the latest uncompleted level.
  // Everything after the cutoff is locked.
  const cutoff = getLatestUncompletedLevelIndex(allScenes, levelStates);
  // We also need to look up the index of each scene in the allScenes array.
  const trueIndexes = theseScenes.map((scene) => {
    const trueIndex = allScenes.indexOf(scene);
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
  const allScenes = useScenes();

  const lockedSceneIndexes = useMemo(() => {
    const result = getLockedSceneIndexes(
      allScenes,
      props.scenes,
      saveData.levelStates
    );
    return result;
  }, [allScenes, props.scenes, saveData.levelStates]);

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
