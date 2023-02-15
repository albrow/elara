import { Offset } from "../../lib/utils";
import { TILE_SIZE, WALL_Z_INDEX } from "../../lib/constants";
import rockImgUrl from "../../images/rock.png";

interface ObstacleProps {
  offset: Offset;
  fuzzy: boolean;
}

export default function Obstacle(props: ObstacleProps) {
  return (
    // Might change this later, but for now, if the obstacle is "fuzzy",
    // we don't want to render it. "Fuzzy" means that the obstacle may
    // or may not be there. Eventually, we will probably use an animation.
    //
    // TODO(albrow): Add animation of obstacles falling/sliding into place.
    !props.fuzzy && (
      <img
        className="rock sprite"
        alt="rock"
        src={rockImgUrl}
        style={{
          width: `${TILE_SIZE - 1}px`,
          height: `${TILE_SIZE - 1}px`,
          zIndex: WALL_Z_INDEX,
          left: props.offset.left,
          top: props.offset.top,
        }}
      />
    )
  );
}
