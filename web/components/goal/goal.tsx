import { Offset } from "../../lib/utils";
import { TILE_SIZE, GOAL_Z_INDEX } from "../../lib/constants";
import flagImgUrl from "../../images/flag.png";

interface GoalProps {
  offset: Offset;
}

export default function Goal(props: GoalProps) {
  return (
    <img
      className="flag sprite"
      src={flagImgUrl}
      style={{
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        zIndex: GOAL_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    />
  );
}
