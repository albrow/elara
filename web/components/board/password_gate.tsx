import { Image } from "@chakra-ui/react";
import {
  LOCKED_GATE_Z_INDEX,
  SPRITE_DROP_SHADOW,
  UNLOCKED_GATE_Z_INDEX,
} from "../../lib/constants";
import lockedImgUrl from "../../images/board/password_gate_locked.png";
import unlockedImgUrl from "../../images/board/password_gate_unlocked.png";
import { Offset } from "../../lib/utils";
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
      <Image
        alt={props.open ? "unlocked password gate" : "locked password gate"}
        src={props.open ? unlockedImgUrl : lockedImgUrl}
        position="absolute"
        w="48px"
        h="72px"
        zIndex={props.open ? UNLOCKED_GATE_Z_INDEX : LOCKED_GATE_Z_INDEX}
        left={props.offset.left}
        top={props.offset.topNum - 24}
        filter={props.open ? "none" : SPRITE_DROP_SHADOW}
      />
    </>
  );
}
