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
      alt="goal"
      src={flagImgUrl}
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
