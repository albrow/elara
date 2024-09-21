import { Box, Image, Tooltip } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_STEP_TIME,
  LOCKED_GATE_Z_INDEX,
  SPRITE_DROP_SHADOW,
  UNLOCKED_GATE_Z_INDEX,
} from "../../lib/constants";
import nwseLockedImgUrl from "../../images/board/pw_gate_nw_se_locked.png";
import nwseUnlockedImgUrl from "../../images/board/gate_nw_se_unlocked.png";
import neswLockedImgUrl from "../../images/board/pw_gate_ne_sw_locked.png";
import neswUnlockedImgUrl from "../../images/board/gate_ne_sw_unlocked.png";
import neswOverlayImgUrl from "../../images/board/pw_gate_ne_sw_overlay.gif";
import nwseOverlayImgUrl from "../../images/board/pw_gate_nw_se_overlay.gif";
import {
  Offset,
  getTileSize,
  getDefaultSpriteDims,
} from "../../lib/board_utils";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import { useSoundManager } from "../../hooks/sound_manager_hooks";
import BoardHoverInfo from "./board_hover_info";
import PasswordGatePage from "./hover_info_pages/password_gate.mdx";

// Amount of time (in milliseocnds) to wait before playing the "wrong password"
// sound effect if the wrong password is used.
const WRONG_PASSWORD_DELAY_MS = 250;

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
  // Whether to enable motion-based animations and sound effects.
  enableAnimations: boolean;
  scale: number;
  filter?: string;
}

export default function PasswordGate(props: PasswordGateProps) {
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );

  const { getSound } = useSoundManager();
  const wrongPasswordSound = useMemo(
    () => getSound("wrong_password"),
    [getSound]
  );
  const wrongPasswordTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showWrongPassword, setShowWrongPassword] = useState(false);

  const stopMySoundEffects = useCallback(() => {
    wrongPasswordSound.stop();
    if (wrongPasswordTimeout.current) {
      clearTimeout(wrongPasswordTimeout.current);
    }
  }, [wrongPasswordSound]);

  // If the wrong password was not said on this simulation step, stop
  // all the timers and sound effects.
  useEffect(() => {
    if (!props.wrongPassword) {
      stopMySoundEffects();
      if (wrongPasswordTimeout.current) {
        clearTimeout(wrongPasswordTimeout.current);
      }
      setShowWrongPassword(false);
    }
  }, [props.wrongPassword, stopMySoundEffects]);

  // If the wrong password was said on this simulation step and
  // animations are enabled, play the sound effect and show the
  // "wrong password" indicator after a short delay.
  useEffect(() => {
    if (!props.enableAnimations) {
      stopMySoundEffects();
    } else if (props.wrongPassword) {
      if (wrongPasswordTimeout.current) {
        clearTimeout(wrongPasswordTimeout.current);
      }
      wrongPasswordTimeout.current = setTimeout(() => {
        if (!props.enableAnimations) {
          return;
        }
        wrongPasswordSound.play();
        setShowWrongPassword(true);

        // Hide the indicator again after a short delay.
        wrongPasswordTimeout.current = setTimeout(() => {
          setShowWrongPassword(false);
        }, DEFAULT_STEP_TIME - WRONG_PASSWORD_DELAY_MS);
      }, WRONG_PASSWORD_DELAY_MS);
    }
    return () => {
      if (wrongPasswordTimeout.current) {
        clearTimeout(wrongPasswordTimeout.current);
      }
    };
  }, [props, stopMySoundEffects, props.enableAnimations, wrongPasswordSound]);

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
        <Tooltip
          label="Wrong password"
          bgColor="red.600"
          isOpen={
            // Show the wrong password indicator if the wrong password was said
            // if animations are enabled, showWrongPassword will control the visibility
            // of the indicator. This lets us show the indicator after a short delay.
            // If animations are disabled, we just show the indicator immediately if
            // the wrong password was said.
            showWrongPassword ||
            (props.wrongPassword && !props.enableAnimations)
          }
          placement={getWrongPasswordPlacement()}
          variant="rover-message" // Not technically a rover message, but this gives us the right z-index.
        >
          <Box w={`${tileSize}px`} h={`${tileSize}px`}>
            <Image
              position="absolute"
              src={imgUrl}
              h={`${spriteDims.height}px`}
              w={`${spriteDims.width}px`}
              ml={`${spriteDims.marginLeft}px`}
              mt={`${spriteDims.marginTop}px`}
              zIndex={props.open ? UNLOCKED_GATE_Z_INDEX : LOCKED_GATE_Z_INDEX}
              filter={SPRITE_DROP_SHADOW}
            />
            {!props.open && (
              <Image
                position="absolute"
                src={overlayImageUrl}
                h={`${spriteDims.height}px`}
                w={`${spriteDims.width}px`}
                ml={`${spriteDims.marginLeft}px`}
                mt={`${spriteDims.marginTop}px`}
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
