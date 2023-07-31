import { Offset } from "../../lib/utils";
import { GATE_Z_INDEX, TILE_SIZE } from "../../lib/constants";
import lockedImgUrl from "../../images/board/locked.png";
import unlockedImgUrl from "../../images/board/unlocked.png";
import BoardHoverInfo from "./board_hover_info";
import GatePage from "./hover_info_pages/gate.mdx";

export interface GateProps {
  offset: Offset;
  open: boolean;
  additionalInfo: string;
  enableHoverInfo: boolean;
}

export default function Gate(props: GateProps) {
  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={GatePage}
          offset={props.offset}
          additionalInfo={props.additionalInfo}
        />
      )}
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
    </>
  );
}
