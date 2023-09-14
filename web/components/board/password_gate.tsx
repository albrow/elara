import { Box, Image, Tooltip } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import {
  LOCKED_GATE_Z_INDEX,
  SPRITE_DROP_SHADOW,
  TILE_SIZE,
  UNLOCKED_GATE_Z_INDEX,
} from "../../lib/constants";
import nwseLockedImgUrl from "../../images/board/pw_gate_nw_se_locked.png";
import nwseUnlockedImgUrl from "../../images/board/gate_nw_se_unlocked.png";
import neswLockedImgUrl from "../../images/board/pw_gate_ne_sw_locked.png";
import neswUnlockedImgUrl from "../../images/board/gate_ne_sw_unlocked.png";
import neswOverlayImgUrl from "../../images/board/pw_gate_ne_sw_overlay.gif";
import nwseOverlayImgUrl from "../../images/board/pw_gate_nw_se_overlay.gif";
import { Offset } from "../../lib/utils";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import BoardHoverInfo from "./board_hover_info";
import PasswordGatePage from "./hover_info_pages/password_gate.mdx";

export interface PasswordGateProps {
  offset: Offset;
  open: boolean;
  additionalInfo: string;
  enableHoverInfo: boolean;
  variant: "nwse" | "nesw";
  // True if the wrong password was said at the current step.
  wrongPassword: boolean;
  // Used to determine where to place the "wrong password"
  // indicator.
  playerPos: Pos;
}

export default function PasswordGate(props: PasswordGateProps) {
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

  const getWrongPasswordPlacement = useCallback(() => {
    // Use the appropriate tooltip position based on the gate position and
    // the player position.
    const gatePos = props.offset.pos;
    if (!gatePos) {
      throw new Error("Gate position is undefined");
    }

    if (gatePos.y === 0) {
      // Gate is on the top row, prefer to display the "wrong password"
      // message on the bottom, but we can't do that if the player is right
      // below the gate.

      if (props.playerPos.y === 1) {
        // Player is right below the gate, so display the message on the right or left.
        if (gatePos.x <= 5) {
          return "right";
        }
        return "left";
      }

      return "bottom";
    }
    // Gate is not on the top row, so we prefer to display the "wrong password"
    // message on the top, but we can't do that if the player is right above the gate.
    if (props.playerPos.y === gatePos.y - 1) {
      // Player is right above the gate, so display the message on the right or left.
      if (gatePos.x <= 5) {
        return "right";
      }
      return "left";
    }

    // By default, show the message on top.
    return "top";
  }, [props.offset.pos, props.playerPos.y]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={PasswordGatePage}
          offset={props.offset}
          additionalInfo={props.additionalInfo}
        />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={props.open ? UNLOCKED_GATE_Z_INDEX : LOCKED_GATE_Z_INDEX}
      >
        <Tooltip
          label="Wrong password"
          bgColor="red.600"
          hasArrow
          isOpen={props.wrongPassword}
          placement={getWrongPasswordPlacement()}
          variant="rover-message" // Not technically a rover message, but this gives us the right z-index.
        >
          <Box w={`${TILE_SIZE}px`} h={`${TILE_SIZE}px`}>
            <Image
              position="absolute"
              alt="password gate"
              src={imgUrl}
              w="48px"
              h="48px"
              zIndex={props.open ? UNLOCKED_GATE_Z_INDEX : LOCKED_GATE_Z_INDEX}
              filter={SPRITE_DROP_SHADOW}
            />
            {!props.open && (
              <Image
                position="absolute"
                alt="password gate"
                src={overlayImageUrl}
                w="48px"
                h="48px"
                zIndex={
                  props.open
                    ? UNLOCKED_GATE_Z_INDEX + 1
                    : LOCKED_GATE_Z_INDEX + 1
                }
              />
            )}
          </Box>
        </Tooltip>
      </Box>
    </>
  );
}
