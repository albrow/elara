import { useRouter } from "react-router5";
import { Badge, Box, Button, Text } from "@chakra-ui/react";
import { Fragment, useCallback } from "react";

import { MdLock } from "react-icons/md";
import type { Scene } from "../../lib/scenes";
import DisablableLink from "../scene_link";

interface SceneLinkProps {
  scene: Scene;
  onClick?: () => void;
}

export default function SceneLink(props: SceneLinkProps) {
  const router = useRouter();
  const isActive = router.isActive(
    props.scene.routeName,
    props.scene.routeParams
  );

  const getHoverStyle = useCallback(() => {
    if (isActive) {
      return { backgroundColor: "var(--chakra-colors-gray-500)" };
    }
    return { backgroundColor: "var(--chakra-colors-gray-400)" };
  }, [isActive]);

  const getSceneName = useCallback(() => {
    // If the scene is a level, then we want to include the level
    // index in the link text.
    if (props.scene.type === "level") {
      return `${props.scene.levelIndex}: ${props.scene.level?.name}`;
    }
    return props.scene.name;
  }, [props.scene]);

  const getSceneIcons = useCallback(() => {
    if (!props.scene.unlocked) {
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
    const icons = [];
    if (props.scene.unlocked && !props.scene.completed) {
      icons.push(
        <Badge
          colorScheme="green"
          mr="0.3rem"
          // fontSize={{
          //   base: "12px",
          //   "3xl": "16px",
          // }}
        >
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
  }, [props.scene.unlocked, props.scene.completed]);

  return (
    <DisablableLink
      scene={props.scene}
      disabled={!props.scene.unlocked}
      onClick={props.onClick}
    >
      <Button
        backgroundColor={isActive ? "gray.500" : "transparent"}
        _active={{ backgroundColor: "transparent" }}
        _hover={getHoverStyle()}
        w="100%"
        textAlign="left"
        justifyContent="left"
        isDisabled={!props.scene.unlocked}
        h="max-content"
        px="14px"
        py={{
          base: "6px",
          // xl: "8px",
          // "2xl": "10px",
          // "3xl": "12px",
        }}
        // fontSize={{
        //   base: "md",
        //   xl: "lg",
        //   "2xl": "xl",
        //   "3xl": "3xl",
        // }}
      >
        <Box>
          <Text
            as="span"
            display="inline"
            fontWeight="bold"
            color={isActive ? "white" : "black"}
          >
            {getSceneIcons()}
            <Text display="inline" verticalAlign="middle" align="left">
              {getSceneName()}
            </Text>
          </Text>
        </Box>
      </Button>
    </DisablableLink>
  );
}
