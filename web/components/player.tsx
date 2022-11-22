import { Offset } from "../lib/utils";
import {
  TILE_SIZE,
  PLAYER_Z_INDEX,
  PLAYER_MESSAGE_Z_INDEX,
} from "../lib/constants";
import robotImgUrl from "../images/robot.png";
import glitchyRobotImgUrl from "../images/robot_glitchy.gif";
import { Pos } from "../../elara-lib/pkg/elara_lib";

interface PlayerProps {
  offset: Offset;
  fuel: number;
  message: string;
  fuzzy: boolean;
}

function speechBubbleClass(pos: Pos, msg: string): string {
  // This part is common regardless of whether the speech bubble
  // is aligned to the left or right.
  let classNames =
    "absolute rounded bg-white p-1 shadow -top-3 border-gray-400 border ";

  if (msg.length <= 2) {
    classNames += "w-8 ";
  } else {
    classNames += "min-w-max ";
  }

  if (pos.x <= 4) {
    // left-aligned speech bubble.
    classNames += "text-left left-3 ";
  } else {
    // right-aligned speech bubble.
    classNames += "text-right right-3 ";
  }
  return classNames;
}

// Compute the "before" psuedo-class to add the little triangle
// at the bottom of the speech bubble. Based roughly on
// https://codingislove.com/css-speech-bubbles/
function speechBubblePsuedoClass(pos: Pos): string {
  // This part is common regardless of whether the speech bubble
  // is aligned to the left or right.
  let classNames =
    "before:absolute before:w-0 before:h-0 before:border-[7px] before:border-transparent ";
  if (pos.x <= 4) {
    // left-aligned speech bubble.
    classNames +=
      "before:border-t-white before:border-l-white before:left-[14px] before:bottom-[-14px] ";
  } else {
    // right-aligned speech bubble.
    classNames +=
      "before:border-t-white before:border-r-white before:right-[14px] before:bottom-[-14px] ";
  }
  return classNames;
}

export default function Player(props: PlayerProps) {
  return (
    <div
      className="player sprite"
      style={{
        width: `${TILE_SIZE - 1}px`,
        height: `${TILE_SIZE - 1}px`,
        zIndex: PLAYER_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    >
      <img
        className="playerImage"
        src={props.fuzzy ? glitchyRobotImgUrl : robotImgUrl}
      />
      <span
        className="fuelCount text-white text-xs font-mono absolute bottom-0 right-0.5 drop-shadow-[0_0_1px_rgba(0,0,0,1.0)]"
        style={{ zIndex: PLAYER_Z_INDEX + 1 }}
      >
        {props.fuel}
      </span>
      <div
        id="player-message"
        hidden={props.message == ""}
        className={
          speechBubbleClass(props.offset.pos, props.message) +
          speechBubblePsuedoClass(props.offset.pos)
        }
        style={{
          zIndex: PLAYER_MESSAGE_Z_INDEX,
        }}
      >
        {props.message}
      </div>
    </div>
  );
}
