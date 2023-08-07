import { Image } from "@chakra-ui/react";

import { useMemo } from "react";
import {
  LOCKED_GATE_Z_INDEX,
  SPRITE_DROP_SHADOW,
  UNLOCKED_GATE_Z_INDEX,
} from "../../lib/constants";
import nwseLockedImgUrl from "../../images/board/gate_nw_se_locked.png";
import nwseUnlockedImgUrl from "../../images/board/gate_nw_se_unlocked.png";
import neswLockedImgUrl from "../../images/board/gate_ne_sw_locked.png";
import neswUnlockedImgUrl from "../../images/board/gate_ne_sw_unlocked.png";
import neswOverlayImgUrl from "../../images/board/gate_ne_sw_overlay.gif";
import nwseOverlayImgUrl from "../../images/board/gate_nw_se_overlay.gif";
import { Offset } from "../../lib/utils";
import BoardHoverInfo from "./board_hover_info";
import GatePage from "./hover_info_pages/gate.mdx";

export interface GateProps {
  offset: Offset;
  open: boolean;
  additionalInfo: string;
  enableHoverInfo: boolean;
  variant: "nwse" | "nesw";
}

export default function Gate(props: GateProps) {
  const imgUrl = useMemo(() => {
    if (props.variant === "nwse") {
      return props.open ? nwseUnlockedImgUrl : nwseLockedImgUrl;
    }
    return props.open ? neswUnlockedImgUrl : neswLockedImgUrl;
  }, [props.open, props.variant]);

  const overlayImageUrl = useMemo(() => {
    if (props.variant === "nwse") {
      return nwseOverlayImgUrl;
    }
    return neswOverlayImgUrl;
  }, [props.variant]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={GatePage}
          offset={props.offset}
          additionalInfo={props.additionalInfo}
        />
      )}

      <Image
        alt="gate"
        src={imgUrl}
        position="absolute"
        w="48px"
        h="48px"
        zIndex={props.open ? UNLOCKED_GATE_Z_INDEX : LOCKED_GATE_Z_INDEX}
        left={props.offset.left}
        top={props.offset.top}
        filter={SPRITE_DROP_SHADOW}
      />
      {!props.open && (
        <Image
          alt="gate"
          src={overlayImageUrl}
          position="absolute"
          w="48px"
          h="48px"
          zIndex={
            props.open ? UNLOCKED_GATE_Z_INDEX + 1 : LOCKED_GATE_Z_INDEX + 1
          }
          left={props.offset.left}
          top={props.offset.top}
        />
      )}
    </>
  );
}
