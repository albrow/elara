import { Badge, Box, Button, Text, Tooltip } from "@chakra-ui/react";
import { Fragment, useCallback, useMemo } from "react";

import { MdLock, MdCheckCircle, MdCheckCircleOutline } from "react-icons/md";
import { BsStar, BsStarFill } from "react-icons/bs";
import type { Scene } from "../lib/scenes";
import {
  useNextLevelToBeUnlocked,
  useNextUnlockedScene,
} from "../hooks/scenes_hooks";

interface LevelSelectOptionProps {
  scene: Scene;
  isLocked: boolean;
  isActive: boolean;
  onClick?: () => void;
}

export default function LevelSelectOption(props: LevelSelectOptionProps) {
  const nextLevelToBeUnlocked = useNextLevelToBeUnlocked();
  const nextUnlockedScene = useNextUnlockedScene();

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

    if (!props.scene.completed) {
      icons.push(
        <Badge colorScheme="green" ml="0.3rem">
          New
        </Badge>
      );
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

  // If the level is locked, we want to show a tooltip explaining why.
  // However, we only need to show this tooltip in certain cases.
  const enableLockExplanationTooltip = useMemo(
    () =>
      props.isLocked &&
      nextLevelToBeUnlocked.name === props.scene.name &&
      nextUnlockedScene.type !== "level",
    [
      nextLevelToBeUnlocked.name,
      nextUnlockedScene.type,
      props.isLocked,
      props.scene.name,
    ]
  );

  const lockExplanationText = useMemo(() => {
    if (nextUnlockedScene.type === "cutscene") {
      return `You must watch a cutscene first. (Beat the previous level, then press "Play Cutscene").`;
    }
    if (nextUnlockedScene.type === "dialog") {
      return "Answer the video call to unlock this level.";
    }
    if (nextUnlockedScene.type === "journal") {
      return "Read the latest journal page(s) to unlock this level.";
    }
    if (nextUnlockedScene.type === "level") {
      return "Beat the previous level to unlock this one.";
    }
    throw new Error(`Unexpected scene type: ${nextUnlockedScene.type}`);
  }, [nextUnlockedScene.type]);

  // TODO(albrow):
  //
  //    1. Show a preview for each level (thumbnail + brief description). Either a screen shot or render of the level at ~50% scale.
  //    2. Automatically select the next level that is unlocked.
  //
  return (
    <Tooltip
      label={lockExplanationText}
      placement="bottom"
      bgColor="red.700"
      isDisabled={!enableLockExplanationTooltip}
      mt="-10px"
    >
      <Button
        isActive={props.isActive}
        background="transparent"
        _hover={getHoverStyle()}
        _active={getHoverStyle()}
        w="100%"
        textAlign="left"
        justifyContent="left"
        isDisabled={props.isLocked}
        h="max-content"
        px="14px"
        py="6px"
        mb="2px"
        onClick={props.onClick}
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
    </Tooltip>
  );
}
