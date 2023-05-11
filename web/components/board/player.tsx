import { Tooltip, PlacementWithLogical, Box } from "@chakra-ui/react";

import { useCallback, useMemo } from "react";
import { Offset } from "../../lib/utils";
import {
  TILE_SIZE,
  PLAYER_Z_INDEX,
  PLAYER_MESSAGE_Z_INDEX,
} from "../../lib/constants";
import groverUpUrl from "../../images/grover_up.png";
import groverDownUrl from "../../images/grover_down.png";
import groverLeftUrl from "../../images/grover_left.png";
import groverRightUrl from "../../images/grover_right.png";
import { Pos, TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import SpriteLabel from "./sprite_label";
import { getSpriteAnimations } from "./anim_utils";

interface PlayerProps {
  offset: Offset;
  fuel: number;
  message: string;
  animState: string;
  animData?: TeleAnimData;
  enableAnimations: boolean;
  facing: string;
}

function speechBubblePlacement(pos: Pos | undefined): PlacementWithLogical {
  if (!pos) {
    return "auto";
  }
  return pos.x <= 4 ? "right" : "auto";
}

export default function Player(props: PlayerProps) {
  const animation = useMemo(
    () =>
      getSpriteAnimations(
        props.enableAnimations,
        props.animState,
        props.animData
      ),
    [props.animData, props.animState, props.enableAnimations]
  );

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
      {animation.definitions}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={PLAYER_Z_INDEX}
        style={animation.style}
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
              filter: "drop-shadow(-2px 2px 2px rgba(0, 0, 0, 0.3))",
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
