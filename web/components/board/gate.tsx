import { Offset } from "../../lib/utils";
import { GATE_Z_INDEX, TILE_SIZE } from "../../lib/constants";
import lockedImgUrl from "../../images/locked.png";
import unlockedImgUrl from "../../images/unlocked.png";

interface GateProps {
  offset: Offset;
  open: boolean;
  // fuzzy: boolean;
}

export default function Gate(props: GateProps) {
  return (
    <img
      alt={props.open ? "locked gate" : "unlocked gate"}
      src={props.open ? unlockedImgUrl : lockedImgUrl}
      style={{
        position: "absolute",
        width: `${TILE_SIZE - 1}px`,
        height: `${TILE_SIZE - 1}px`,
        zIndex: GATE_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
        opacity: props.open ? 0.4 : 1,
      }}
    />
  );
}
