import { Offset } from "../../lib/utils";
import { TILE_SIZE, WALL_Z_INDEX } from "../../lib/constants";
import rockImgUrl from "../../images/rock.png";

interface ObstacleProps {
  offset: Offset;
}

export default function Obstacle(props: ObstacleProps) {
  return (
    <img
      className="rock sprite"
      src={rockImgUrl}
      style={{
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        zIndex: WALL_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    />
  );
}
