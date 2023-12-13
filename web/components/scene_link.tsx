import { Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import type { Scene } from "../lib/scenes";
import { useSceneNavigator } from "../hooks/scenes_hooks";

export interface DisablableLinkProps {
  scene: Scene;
  disabled?: boolean;
  onClick?: () => void;
}

export default function DisablableLink(
  props: PropsWithChildren<DisablableLinkProps>
) {
  const { navigateToScene } = useSceneNavigator();
  if (props.disabled) {
    return <span>{props.children}</span>;
  }

  return (
    <Box
      onClick={() => {
        navigateToScene(props.scene);
        if (props.onClick) {
          props.onClick();
        }
      }}
    >
      {props.children}
    </Box>
  );
}
