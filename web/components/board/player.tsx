import { Tooltip, PlacementWithLogical, Box } from "@chakra-ui/react";

import { useCallback, useEffect, useMemo } from "react";
import { posToOffset, rowBasedZIndex } from "../../lib/utils";
import { TILE_SIZE, PLAYER_Z_INDEX } from "../../lib/constants";
import groverUpUrl from "../../images/board/grover_up.png";
import groverDownUrl from "../../images/board/grover_down.png";
import groverLeftUrl from "../../images/board/grover_left.png";
import groverRightUrl from "../../images/board/grover_right.png";
import { Pos, TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import { useSoundManager } from "../../hooks/sound_manager_hooks";
import SpriteLabel from "./sprite_label";
import { getSpriteAnimations } from "./anim_utils";
import BoardHoverInfo from "./board_hover_info";
import GroverPage from "./hover_info_pages/grover.mdx";

interface PlayerProps {
  pos: Pos;
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
  const offset = useMemo(() => posToOffset(props.pos), [props.pos]);
  const zIndex = useMemo(
    () => rowBasedZIndex(props.pos.y, PLAYER_Z_INDEX),
    [props.pos.y]
  );

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

  const { getSound, stopAllSoundEffects } = useSoundManager();
  const moveSound = useMemo(() => getSound("move"), [getSound]);
  const turnSound = useMemo(() => getSound("turn"), [getSound]);
  const teleportSound = useMemo(() => getSound("teleport"), [getSound]);
  const bumpSound = useMemo(() => getSound("bump"), [getSound]);
  const speakSound = useMemo(() => getSound("speak"), [getSound]);

  useEffect(() => {
    if (!props.enableAnimations) {
      stopAllSoundEffects();
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
    stopAllSoundEffects,
    moveSound,
    turnSound,
    bumpSound,
    teleportSound,
    speakSound,
  ]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo page={GroverPage} offset={offset} />
      )}
      {animation.definitions}
      <Box
        position="absolute"
        left={offset.left}
        top={offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={zIndex}
        style={animation.style}
      >
        <Tooltip
          hasArrow
          isOpen
          label={props.message}
          bg="white"
          color="black"
          placement={roverMessagePlacement(offset.pos)}
          fontFamily="monospace"
          variant="rover-message"
        >
          <div
            style={{
              width: `${TILE_SIZE - 2}px`,
              height: `${TILE_SIZE - 2}px`,
              marginTop: "1px",
              zIndex,
              filter: "drop-shadow(-2px 3px 2px rgba(0, 0, 0, 0.3))",
            }}
          >
            <img alt="rover" className="playerImage" src={getRobotImgUrl()} />
            <SpriteLabel zIndex={zIndex + 1} value={props.energy} />
          </div>
        </Tooltip>
      </Box>
    </>
  );
}
