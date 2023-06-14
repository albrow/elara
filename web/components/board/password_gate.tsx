import { Offset } from "../../lib/utils";
import { GATE_Z_INDEX, TILE_SIZE } from "../../lib/constants";
import lockedImgUrl from "../../images/locked.png";
import unlockedImgUrl from "../../images/unlocked.png";
import speakerImgUrl from "../../images/speaker.png";
import BoardHoverInfo from "./board_hover_info";
import PasswordGatePage from "./hover_info_pages/password_gate.mdx";

export interface PasswordGateProps {
  offset: Offset;
  open: boolean;
  additionalInfo: string;
  // fuzzy: boolean;
}

export default function PasswordGate(props: PasswordGateProps) {
  return (
    <>
      <BoardHoverInfo
        page={PasswordGatePage}
        offset={props.offset}
        additionalInfo={props.additionalInfo}
      />
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
      <img
        alt="speaker"
        src={speakerImgUrl}
        style={{
          position: "absolute",
          width: `${TILE_SIZE / 2}px`,
          height: `${TILE_SIZE / 2}px`,
          zIndex: GATE_Z_INDEX,
          left: props.offset.left,
          top: `${props.offset.topNum + TILE_SIZE / 2}px`,
          opacity: props.open ? 0.4 : 1,
        }}
      />
    </>
  );
}
