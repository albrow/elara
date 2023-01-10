import { Tooltip, PlacementWithLogical } from "@chakra-ui/react";

import { Offset } from "../../lib/utils";
import {
  TILE_SIZE,
  PLAYER_Z_INDEX,
  PLAYER_MESSAGE_Z_INDEX,
  CSS_ANIM_DURATION,
} from "../../lib/constants";
import robotImgUrl from "../../images/robot.png";
import glitchyRobotImgUrl from "../../images/robot_glitchy.gif";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import SpriteLabel from "./sprite_label";

interface PlayerProps {
  offset: Offset;
  fuel: number;
  message: string;
  fuzzy: boolean;
}

function speechBubblePlacement(pos: Pos): PlacementWithLogical {
  return pos.x <= 4 ? "right" : "auto";
}

export default function Player(props: PlayerProps) {
  return (
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
          width: `${TILE_SIZE - 1}px`,
          height: `${TILE_SIZE - 1}px`,
          zIndex: PLAYER_Z_INDEX,
          left: props.offset.left,
          top: props.offset.top,
          transition: `left ${CSS_ANIM_DURATION}s, top ${CSS_ANIM_DURATION}s`,
        }}
      >
        <img
          alt="rover"
          className="playerImage"
          src={props.fuzzy ? glitchyRobotImgUrl : robotImgUrl}
        />
        <SpriteLabel zIndex={PLAYER_Z_INDEX + 1} value={props.fuel} />
      </div>
    </Tooltip>
  );
}
