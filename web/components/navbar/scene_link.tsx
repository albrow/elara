import { useRouter } from "react-router5";
import { Box, MenuItem, Text } from "@chakra-ui/react";
import { useCallback } from "react";

import { MdLock } from "react-icons/md";
import { Scene } from "../../contexts/scenes";
import DisablableLink from "./disablable_link";

interface SceneLinkProps {
  scene: Scene;
  isLocked: boolean;
}

export default function SceneLink(props: SceneLinkProps) {
  const router = useRouter();
  const isActive = router.isActive(
    props.scene.routeName,
    props.scene.routeParams
  );

  const getHoverStyle = useCallback(() => {
    let style = {};
    if (!isActive && !props.isLocked) {
      style = { background: "var(--chakra-colors-gray-600)" };
    }
    if (props.isLocked) {
      style = {
        ...style,
        background: "var(--chakra-colors-gray-800)",
      };
    }
    return style;
  }, [isActive, props.isLocked]);

  const getSceneName = useCallback(() => {
    // If the scene is a level, then we want to include the level
    // index in the link text.
    if (props.scene.type === "level") {
      return `Level ${props.scene.levelIndex}: ${props.scene.level?.name}`;
    }
    return props.scene.name;
  }, [props.scene]);

  return (
    <DisablableLink
      routeName={props.scene.routeName}
      routeParams={props.scene.routeParams}
      disabled={props.isLocked}
    >
      <MenuItem
        background={isActive ? "gray.600" : "gray.700"}
        _hover={getHoverStyle()}
        isDisabled={props.isLocked}
      >
        <Box>
          <Text
            ml={1}
            display="inline-block"
            fontWeight="bold"
            color={isActive ? "white" : "gray.300"}
          >
            {props.isLocked && (
              <MdLock
                size="1.0em"
                style={{
                  paddingTop: "0.2rem",
                  marginRight: "0.3rem",
                  display: "inline",
                }}
              />
            )}
            {getSceneName()}
          </Text>
        </Box>
      </MenuItem>
    </DisablableLink>
  );
}
