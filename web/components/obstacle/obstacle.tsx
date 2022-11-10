import { Offset } from "../../lib/utils";
import { TILE_SIZE, WALL_Z_INDEX } from "../../lib/constants";
import rockImgUrl from "../../images/rock.png";
import glitchyRockImgUrl from "../../images/rock_glitchy.gif";

interface ObstacleProps {
  offset: Offset;
  fuzzy: boolean;
}

export default function Obstacle(props: ObstacleProps) {
  return (
    <img
      className="rock sprite"
      src={props.fuzzy ? glitchyRockImgUrl : rockImgUrl}
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
