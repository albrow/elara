import { Offset } from "../../lib/utils";
import { TILE_SIZE, TERMINAL_Z_INDEX } from "../../lib/constants";
import tvImageUrl from "../../images/tv.png";

interface GateProps {
  offset: Offset;
  fuzzy: boolean;
}

export default function Gate(props: GateProps) {
  return (
    <img
      className="gate sprite"
      src={tvImageUrl}
      style={{
        width: `${TILE_SIZE - 1}px`,
        height: `${TILE_SIZE - 1}px`,
        zIndex: TERMINAL_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    />
  );
}
