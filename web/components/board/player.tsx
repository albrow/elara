import { Tooltip, PlacementWithLogical, Box, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
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
  animState: string;
  animData?: TeleAnimData;
  enableAnimations: boolean;
  enableHoverInfo: boolean;
  facing: string;
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

  const stopMySoundEffects = useCallback(() => {
    moveSound.stop();
    turnSound.stop();
    bumpSound.stop();
    teleportSound.stop();
    speakSound.stop();
  }, [moveSound, turnSound, bumpSound, teleportSound, speakSound]);

  const formattedMessage = useMemo(() => {
    if (props.message.startsWith(SPECIAL_MARKDOWN_TAG)) {
      return compiler(props.message.replace(SPECIAL_MARKDOWN_TAG, ""));
    }
    return props.message;
  }, [props.message]);

  useEffect(() => {
    if (!props.enableAnimations) {
      stopMySoundEffects();
    } else if (props.animState === "moving") {
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
    }
  }, [
    props,
    stopMySoundEffects,
    moveSound,
    turnSound,
    bumpSound,
    teleportSound,
    speakSound,
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
        <Tooltip
          hasArrow
          isOpen={props.message !== ""}
          label={
            <Text className="rover-message-md-content" as="div">
              {formattedMessage}
            </Text>
          }
          bg="white"
          color="black"
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
