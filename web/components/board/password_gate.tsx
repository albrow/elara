import { Offset } from "../../lib/utils";
import { GATE_Z_INDEX } from "../../lib/constants";
import lockedImgUrl from "../../images/board/password_gate_locked.png";
import unlockedImgUrl from "../../images/board/password_gate_unlocked.png";
import BoardHoverInfo from "./board_hover_info";
import PasswordGatePage from "./hover_info_pages/password_gate.mdx";

export interface PasswordGateProps {
  offset: Offset;
  open: boolean;
  additionalInfo: string;
  enableHoverInfo: boolean;
}

export default function PasswordGate(props: PasswordGateProps) {
  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={PasswordGatePage}
          offset={props.offset}
          additionalInfo={props.additionalInfo}
        />
      )}
      <img
        alt={props.open ? "locked gate" : "unlocked gate"}
        src={props.open ? unlockedImgUrl : lockedImgUrl}
        style={{
          position: "absolute",
          width: `48px`,
          height: `72px`,
          zIndex: GATE_Z_INDEX,
          left: props.offset.left,
          top: props.offset.topNum - 24,
        }}
      />
    </>
  );
}
