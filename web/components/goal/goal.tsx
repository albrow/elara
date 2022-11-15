import { Offset } from "../../lib/utils";
import { TILE_SIZE, GOAL_Z_INDEX } from "../../lib/constants";
import flagImgUrl from "../../images/flag.png";
import glitchyFlagImgUrl from "../../images/flag_glitchy.gif";

interface GoalProps {
  offset: Offset;
  fuzzy: boolean;
}

export default function Goal(props: GoalProps) {
  return (
    <img
      className="flag sprite"
      src={props.fuzzy ? glitchyFlagImgUrl : flagImgUrl}
      style={{
        width: `${TILE_SIZE - 1}px`,
        height: `${TILE_SIZE - 1}px`,
        zIndex: GOAL_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    />
  );
}
