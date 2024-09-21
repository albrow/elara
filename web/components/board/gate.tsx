import { Box, Image } from "@chakra-ui/react";

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
import {
  Offset,
  getDefaultSpriteDims,
  getTileSize,
} from "../../lib/board_utils";
import BoardHoverInfo from "./board_hover_info";
import GatePage from "./hover_info_pages/gate.mdx";

export interface GateProps {
  offset: Offset;
  open: boolean;
  additionalInfo: string;
  enableHoverInfo: boolean;
  variant: "nwse" | "nesw";
  scale: number;
  filter?: string;
}

export default function Gate(props: GateProps) {
  const imgUrl = useMemo(() => {
    if (props.variant === "nwse") {
      return props.open ? nwseUnlockedImgUrl : nwseLockedImgUrl;
    }
    return props.open ? neswUnlockedImgUrl : neswLockedImgUrl;
  }, [props.open, props.variant]);

  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);

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
          scale={props.scale}
        />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${tileSize}px`}
        h={`${tileSize}px`}
        zIndex={props.open ? UNLOCKED_GATE_Z_INDEX : LOCKED_GATE_Z_INDEX}
        filter={props.filter}
      >
        <Box position="relative" w="100%" h="100%">
          <Image
            src={imgUrl}
            position="absolute"
            left="0"
            top="0"
            w={`${spriteDims.width}px`}
            h={`${spriteDims.height}px`}
            filter={SPRITE_DROP_SHADOW}
          />
          {!props.open && (
            <Image
              src={overlayImageUrl}
              position="absolute"
              left="0"
              top="0"
              w={`${spriteDims.width}px`}
              h={`${spriteDims.height}px`}
            />
          )}
        </Box>
      </Box>
    </>
  );
}
