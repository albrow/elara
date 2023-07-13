import { Box, Button, Text } from "@chakra-ui/react";
import { Fragment, useCallback } from "react";

import { MdLock, MdCheckCircle, MdCheckCircleOutline } from "react-icons/md";
import { BsStar, BsStarFill } from "react-icons/bs";
import { Scene } from "../../contexts/scenes";
import DisablableLink from "../navbar/disablable_link";

interface LevelLinkProps {
  scene: Scene;
  isLocked: boolean;
  onClick?: () => void;
}

export default function LevelLink(props: LevelLinkProps) {
  const getHoverStyle = useCallback(() => {
    let style = {};
    if (!props.isLocked) {
      style = { background: "var(--chakra-colors-gray-600)" };
    }
    if (props.isLocked) {
      style = {
        ...style,
        background: "var(--chakra-colors-gray-800)",
      };
    }
    return style;
  }, [props.isLocked]);

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
          <BsStarFill
            size="1.1em"
            color="var(--chakra-colors-yellow-400)"
            style={{
              marginRight: "0.2rem",
              marginBottom: "2px",
              display: "inline",
              verticalAlign: "middle",
            }}
          />
        );
      } else {
        icons.push(
          <BsStar
            size="1.1em"
            style={{
              marginBottom: "2px",
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

  // TODO(albrow):
  //
  //    1. Show a preview for each level (thumbnail + brief description).
  //    2. Automatically select the next level that is unlocked.
  //
  return (
    <DisablableLink
      routeName={props.scene.routeName}
      routeParams={props.scene.routeParams}
      disabled={props.isLocked}
      onClick={props.onClick}
    >
      <Button
        background="transparent"
        _hover={getHoverStyle()}
        w="100%"
        textAlign="left"
        justifyContent="left"
        isDisabled={props.isLocked}
        h="max-content"
        px="14px"
        py="6px"
        mb="2px"
      >
        <Box>
          <Text as="span" display="inline" fontWeight="bold" color="gray.300">
            <Text display="inline" verticalAlign="middle" align="left" mr="8px">
              {getSceneName()}
            </Text>
            {getSceneIcons()}
          </Text>
        </Box>
      </Button>
    </DisablableLink>
  );
}
