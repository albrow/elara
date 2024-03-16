import { Tooltip, PlacementWithLogical, Box, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { compiler } from "markdown-to-jsx";

import {
  PLAYER_Z_INDEX,
  SPRITE_DROP_SHADOW,
  TILE_SIZE,
} from "../../lib/constants";
import groverUpUrl from "../../images/board/grover_up.png";
import groverDownUrl from "../../images/board/grover_down.png";
import groverLeftUrl from "../../images/board/grover_left.png";
import groverRightUrl from "../../images/board/grover_right.png";
import { Pos, TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import { useSoundManager } from "../../hooks/sound_manager_hooks";
import { Offset } from "../../lib/utils";
import SpriteLabel from "./sprite_label";
import { getSpriteAnimations } from "./anim_utils";
import BoardHoverInfo from "./board_hover_info";
import GroverPage from "./hover_info_pages/grover.mdx";

/** Player messages that begin with this
 * special tag will be rendered as markdown.
 */
const SPECIAL_MARKDOWN_TAG = "{markdown}";

interface PlayerProps {
  offset: Offset;
  energy: number;
  message: string;
  errMessage: string;
  animState: string;
  animData?: TeleAnimData;
  enableAnimations: boolean;
  enableHoverInfo: boolean;
  facing: string;
  // Usually truePos == offset.pos, but for the sandbox, truePos is the actual
  // position of the player in the simulation, and pos is the position of the
  // player on the board (the latter is fixed to [0, 0]).
  truePos?: Pos;
}

function roverMessagePlacement(pos: Pos | undefined): PlacementWithLogical {
  if (!pos) {
    return "auto";
  }
  return pos.x <= 4 ? "right" : "auto";
}

export default function Player(props: PlayerProps) {
  const animation = useMemo(
    () =>
      getSpriteAnimations(
        props.enableAnimations,
        props.animState,
        props.animData,
        0.1
      ),
    [props.animData, props.animState, props.enableAnimations]
  );

  const getRobotImgUrl = useCallback(() => {
    switch (props.facing) {
      case "up":
        return groverUpUrl;
      case "down":
        return groverDownUrl;
      case "left":
        return groverLeftUrl;
      case "right":
        return groverRightUrl;
      default:
        throw new Error(`Unknown orientation: + ${props.facing}`);
    }
  }, [props.facing]);

  const { getSound } = useSoundManager();
  const moveSound = useMemo(() => getSound("move"), [getSound]);
  const turnSound = useMemo(() => getSound("turn"), [getSound]);
  const teleportSound = useMemo(() => getSound("teleport"), [getSound]);
  const bumpSound = useMemo(() => getSound("bump"), [getSound]);
  const speakSound = useMemo(() => getSound("speak"), [getSound]);
  const errorSound = useMemo(() => getSound("wrong_password"), [getSound]);

  const stopMySoundEffects = useCallback(() => {
    moveSound.stop();
    turnSound.stop();
    bumpSound.stop();
    teleportSound.stop();
    speakSound.stop();
    errorSound.stop();
  }, [moveSound, turnSound, bumpSound, teleportSound, speakSound, errorSound]);

  const formattedMessage = useMemo(() => {
    if (props.message.startsWith(SPECIAL_MARKDOWN_TAG)) {
      return compiler(props.message.replace(SPECIAL_MARKDOWN_TAG, ""));
    }
    return props.message;
  }, [props.message]);

  // Track the previous state. Helps us determine whether we need
  // to play a sound effect.
  const prevState = useRef(props);

  useEffect(() => {
    if (!props.enableAnimations) {
      stopMySoundEffects();
    } else if (props.animState === "moving") {
      if (
        prevState.current.truePos?.x === props.truePos?.x &&
        prevState.current.truePos?.y === props.truePos?.y
      ) {
        // No need to play a sound effect if the rover position has not changed.
        return;
      }
      moveSound.play();
    } else if (props.animState === "turning") {
      turnSound.play();
    } else if (props.animState === "bumping") {
      bumpSound.play();
    } else if (props.animState === "teleporting") {
      moveSound.play();
      teleportSound.play();
    } else if (props.message !== "") {
      speakSound.play();
    } else if (props.errMessage !== "") {
      errorSound.play();
    }

    prevState.current = props;
  }, [
    props,
    stopMySoundEffects,
    moveSound,
    turnSound,
    bumpSound,
    teleportSound,
    speakSound,
    errorSound,
  ]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo page={GroverPage} offset={props.offset} />
      )}
      {animation.definitions}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={PLAYER_Z_INDEX}
        style={animation.style}
      >
        {/*
          Note: This Tooltip contains both speech bubbles when the player calls the "say" 
          function and error messages (e.g. when the player calls "drop" but they
          aren't holding anything.)
          */}
        <Tooltip
          hasArrow
          isOpen={props.message !== "" || props.errMessage !== ""}
          label={
            <Text className="rover-message-md-content" as="div">
              {formattedMessage || props.errMessage}
            </Text>
          }
          bg={props.message !== "" ? "white" : "red.600"}
          color={props.message !== "" ? "black" : "white"}
          placement={roverMessagePlacement(props.offset.pos)}
          fontFamily="monospace"
          variant="rover-message"
        >
          <div
            style={{
              width: `${TILE_SIZE - 2}px`,
              height: `${TILE_SIZE - 2}px`,
              marginTop: "1px",
              zIndex: PLAYER_Z_INDEX,
              filter: SPRITE_DROP_SHADOW,
            }}
          >
            <img alt="rover" className="playerImage" src={getRobotImgUrl()} />
            <SpriteLabel zIndex={PLAYER_Z_INDEX + 1} value={props.energy} />
          </div>
        </Tooltip>
      </Box>
    </>
  );
}
