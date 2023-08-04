import { useMemo } from "react";
import { Image } from "@chakra-ui/react";
import { GATE_Z_INDEX } from "../../lib/constants";
import lockedImgUrl from "../../images/board/password_gate_locked.png";
import unlockedImgUrl from "../../images/board/password_gate_unlocked.png";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import { posToOffset, rowBasedZIndex } from "../../lib/utils";
import BoardHoverInfo from "./board_hover_info";
import PasswordGatePage from "./hover_info_pages/password_gate.mdx";

export interface PasswordGateProps {
  pos: Pos;
  open: boolean;
  additionalInfo: string;
  enableHoverInfo: boolean;
}

export default function PasswordGate(props: PasswordGateProps) {
  const offset = useMemo(() => posToOffset(props.pos), [props.pos]);
  const zIndex = useMemo(
    () => rowBasedZIndex(props.pos.y, GATE_Z_INDEX),
    [props.pos.y]
  );

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={PasswordGatePage}
          offset={offset}
          additionalInfo={props.additionalInfo}
        />
      )}
      <Image
        alt={props.open ? "locked password gate" : "unlocked password gate"}
        src={props.open ? unlockedImgUrl : lockedImgUrl}
        position="absolute"
        w="48px"
        h="72px"
        zIndex={zIndex}
        left={offset.left}
        top={offset.topNum - 24}
        // TODO(albrow): Standardize drop shadows for sprites.
        filter="drop-shadow(0px 3px 1px rgba(0, 0, 0, 0.3))"
      />
    </>
  );
}
