import { Tooltip, PlacementWithLogical, Box } from "@chakra-ui/react";

import { useCallback } from "react";
import { Offset } from "../../lib/utils";
import {
  TILE_SIZE,
  PLAYER_Z_INDEX,
  PLAYER_MESSAGE_Z_INDEX,
  CSS_ANIM_DURATION,
} from "../../lib/constants";
import groverUpUrl from "../../images/grover_up.png";
import groverDownUrl from "../../images/grover_down.png";
import groverLeftUrl from "../../images/grover_left.png";
import groverRightUrl from "../../images/grover_right.png";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import SpriteLabel from "./sprite_label";

import "../../styles/animations.css";

interface PlayerProps {
  offset: Offset;
  fuel: number;
  message: string;
  animState: string;
  enableAnimations: boolean;
  facing: string;
}

function speechBubblePlacement(pos: Pos): PlacementWithLogical {
  return pos.x <= 4 ? "right" : "auto";
}

export default function Player(props: PlayerProps) {
  const getAnimationStyles = useCallback(() => {
    if (!props.enableAnimations || props.animState === "idle") {
      return { transition: "none" };
    }
    if (props.animState === "teleporting") {
      return {
        transition: `left ${CSS_ANIM_DURATION}s, top ${CSS_ANIM_DURATION}s`,
        animation: `${CSS_ANIM_DURATION}s ease-in-out teleport`,
      };
    }
    return {
      transition: `left ${CSS_ANIM_DURATION}s, top ${CSS_ANIM_DURATION}s`,
    };
  }, [props.animState, props.enableAnimations]);

  const getRobotImgUrl = useCallback(() => {
    switch (props.facing) {
      case "up":
        return groverUpUrl;
      case "down":
        return groverDownUrl;
      case "left":
        return groverLeftUrl;
      case "right":
        return groverRightUrl;
      default:
        throw new Error(`Unknown orientation: + ${props.facing}`);
    }
  }, [props.facing]);

  return (
    <Box
      position="absolute"
      left={props.offset.left}
      top={props.offset.top}
      w={`${TILE_SIZE}px`}
      h={`${TILE_SIZE}px`}
      zIndex={PLAYER_Z_INDEX}
      style={getAnimationStyles()}
    >
      <Tooltip
        hasArrow
        isOpen
        label={props.message}
        bg="white"
        color="black"
        zIndex={PLAYER_MESSAGE_Z_INDEX}
        placement={speechBubblePlacement(props.offset.pos)}
        fontFamily="monospace"
      >
        <div
          className="player sprite"
          style={{
            width: `${TILE_SIZE - 2}px`,
            height: `${TILE_SIZE - 2}px`,
            marginTop: "1px",
            zIndex: PLAYER_Z_INDEX,
          }}
        >
          <img alt="rover" className="playerImage" src={getRobotImgUrl()} />
          <SpriteLabel zIndex={PLAYER_Z_INDEX + 1} value={props.fuel} />
        </div>
      </Tooltip>
    </Box>
  );
}
