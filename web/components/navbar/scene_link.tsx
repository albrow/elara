import { useRouter } from "react-router5";
import { Box, MenuItem, Text } from "@chakra-ui/react";
import { Fragment, useCallback } from "react";

import {
  MdLock,
  MdCheckCircle,
  MdCheckCircleOutline,
  MdStar,
  MdStarBorder,
} from "react-icons/md";
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
      return `${props.scene.levelIndex}: ${props.scene.level?.name}`;
    }
    return props.scene.name;
  }, [props.scene]);

  const getSceneIcons = useCallback(() => {
    if (props.isLocked) {
      return (
        <MdLock
          size="1.1em"
          style={{
            marginRight: "0.3rem",
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      );
    }
    if (props.scene.type !== "level") {
      return null;
    }
    const icons = [];
    if (props.scene.completed) {
      icons.push(
        <MdCheckCircle
          size="1.3em"
          color="var(--chakra-colors-green-400)"
          style={{
            marginRight: "0.3rem",
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      );
    } else {
      icons.push(
        <MdCheckCircleOutline
          size="1.3em"
          style={{
            marginRight: "0.3rem",
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      );
    }

    if (props.scene.level?.challenge) {
      if (props.scene.challengeCompleted) {
        icons.push(
          <MdStar
            size="1.2em"
            color="var(--chakra-colors-yellow-400)"
            style={{
              marginRight: "0.2rem",
              display: "inline",
              verticalAlign: "middle",
            }}
          />
        );
      } else {
        icons.push(
          <MdStarBorder
            size="1.2em"
            style={{
              marginRight: "0.2rem",
              display: "inline",
              verticalAlign: "middle",
            }}
          />
        );
      }
    }

    return (
      <>
        {icons.map((icon) => (
          <Fragment key={icon.type}>{icon}</Fragment>
        ))}
      </>
    );
  }, [
    props.isLocked,
    props.scene.challengeCompleted,
    props.scene.completed,
    props.scene.level?.challenge,
    props.scene.type,
  ]);

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
            as="span"
            ml={1}
            display="inline"
            fontWeight="bold"
            color={isActive ? "white" : "gray.300"}
          >
            {getSceneIcons()}
            <Text display="inline" verticalAlign="middle">
              {getSceneName()}
            </Text>
          </Text>
        </Box>
      </MenuItem>
    </DisablableLink>
  );
}
