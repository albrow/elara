import { Tooltip, PlacementWithLogical, Box } from "@chakra-ui/react";

import { useCallback } from "react";
import { Offset, posToOffset } from "../../lib/utils";
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
import { Pos, TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import SpriteLabel from "./sprite_label";

interface PlayerProps {
  offset: Offset;
  fuel: number;
  message: string;
  animState: string;
  animData: TeleAnimData | undefined;
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
        animation: `${CSS_ANIM_DURATION}s ease-in-out teleport`,
      };
    }
    return {
      transition: `left ${CSS_ANIM_DURATION}s, top ${CSS_ANIM_DURATION}s`,
    };
  }, [props.animState, props.enableAnimations]);

  // Returns a style tag containing any definitions for CSS keyframe
  // animations (e.g. for teleporting). The definitions can change
  // based on the state and position of the player.
  const getAnimationDefinitions = useCallback(() => {
    if (!props.enableAnimations) {
      return null;
    }
    if (props.animState === "teleporting") {
      const startOffset = posToOffset(props.animData!.start_pos);
      const enterOffset = posToOffset(props.animData!.enter_pos);
      const exitOffset = posToOffset(props.animData!.exit_pos);
      return (
        <style>
          {`@keyframes teleport {
            0% {
              left: ${startOffset.left};
              top: ${startOffset.top};
              transform: scale(1) rotate(0deg);
            }
            25% {
              transform: scale(0.25) rotate(180deg);
            }
            35% {
              left: ${enterOffset.left};
              top: ${enterOffset.top};
            }
            50% {
              transform: scale(0.1) rotate(360deg);
            }
            75% {
              transform: scale(0.25) rotate(540deg);
            }
            90% {
              left: ${exitOffset.left};
              top: ${exitOffset.top};
              transform: scale(1) rotate(720deg);
            }
            100% {
              left: ${exitOffset.left};
              top: ${exitOffset.top};
              transform: scale(1) rotate(720deg);
            }
          }`}
        </style>
      );
    }
    return null;
  }, [props.animData, props.animState, props.enableAnimations]);

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
    <>
      {getAnimationDefinitions()}
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
    </>
  );
}
