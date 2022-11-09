import { Offset } from "../../lib/utils";
import { TILE_SIZE, BUG_Z_INDEX } from "../../lib/constants";
import bugImgUrl from "../../images/bug.png";

interface EnemyProps {
  offset: Offset;
}

export default function Enemy(props: EnemyProps) {
  return (
    <img
      className="bug sprite"
      src={bugImgUrl}
      style={{
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        zIndex: BUG_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    />
  );
}
