import { useLocation } from "react-router-dom";
import { Box, MenuItem, Text } from "@chakra-ui/react";
import { useCallback } from "react";

import { MdLock } from "react-icons/md";
import { LevelState, useSaveData } from "../../contexts/save_data";
import { getSceneFromRoute, Scene, SCENES } from "../../lib/scenes";
import DisablableLink from "./disablable_link";

interface SceneLinkProps {
  scene: Scene;
}

function isSceneIndexUnlocked(
  levelStates: Record<string, LevelState>,
  index: number
) {
  // The first scene is always considered unlocked.
  if (index === 0) {
    return true;
  }

  // The scene is considered "unlocked" if the nearest previous level
  // has been completed.
  for (let i = index - 1; i >= 0; i -= 1) {
    const prevScene = SCENES[i];
    if (prevScene.type === "level") {
      const levelName = prevScene.level?.short_name;
      const levelState = levelStates[levelName as string];
      return levelState != null && levelState.completed;
    }
  }

  // If there is no previous level, then the scene is unlocked by default.
  return true;
}

export default function SceneLink(props: SceneLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === props.scene.route;
  const [saveData, _] = useSaveData();

  const isUnlocked = useCallback(() => {
    const thisScene = getSceneFromRoute(props.scene.route);
    if (thisScene == null) {
      throw new Error("Invalid route");
    }
    const sceneIndex = SCENES.indexOf(thisScene);
    return isSceneIndexUnlocked(saveData.levelStates, sceneIndex);
  }, [props.scene.route, saveData.levelStates]);

  const getHoverStyle = useCallback(() => {
    let style = {};
    if (!isActive && isUnlocked()) {
      style = { background: "var(--chakra-colors-gray-600)" };
    }
    if (!isUnlocked()) {
      style = {
        ...style,
        background: "var(--chakra-colors-gray-800)",
      };
    }
    return style;
  }, [isActive, isUnlocked]);

  return (
    <DisablableLink to={props.scene.route} disabled={!isUnlocked()}>
      <MenuItem
        background={isActive ? "gray.600" : "gray.700"}
        _hover={getHoverStyle()}
        isDisabled={!isUnlocked()}
      >
        <Box>
          <Text
            ml={1}
            display="inline-block"
            fontWeight="bold"
            color={isActive ? "white" : "gray.300"}
          >
            {!isUnlocked() && (
              <MdLock
                size="1.0em"
                style={{
                  paddingTop: "0.2rem",
                  marginRight: "0.3rem",
                  display: "inline",
                }}
              />
            )}
            {props.scene.name}
          </Text>
        </Box>
      </MenuItem>
    </DisablableLink>
  );
}
