import { Offset } from "../../lib/utils";
import { TILE_SIZE, BUG_Z_INDEX } from "../../lib/constants";
import bugImgUrl from "../../images/bug.png";
import glitchyBugImgUrl from "../../images/bug_glitchy.gif";

interface EnemyProps {
  offset: Offset;
  fuzzy: boolean;
}

export default function Enemy(props: EnemyProps) {
  return (
    <img
      alt="bug"
      className="bug sprite"
      src={props.fuzzy ? glitchyBugImgUrl : bugImgUrl}
      style={{
        width: `${TILE_SIZE - 1}px`,
        height: `${TILE_SIZE - 1}px`,
        zIndex: BUG_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    />
  );
}
