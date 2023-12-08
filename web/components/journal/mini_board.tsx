import { Box } from "@chakra-ui/react";

import { useCallback } from "react";
import Player from "../board/player";
import DataPoint from "../board/data_point";
import {
  // eslint-disable-next-line camelcase
  new_pos,
  State as RState,
  DataPoint as RDataPoint,
  Pos,
} from "../../../elara-lib/pkg/elara_lib";
import { Offset, posToOffset } from "../../lib/utils";

import lunarSurfaceBgUrl from "../../images/board/lunar_surface_bg.jpg";
import { AXIS_WIDTH, CSS_ANIM_DURATION, TILE_SIZE } from "../../lib/constants";

export interface MiniBoardProps {
  state: RState;
  enableAnimations: boolean;
}

export default function MiniBoard(props: MiniBoardProps) {
  // For mini board, player is always at 0,0.
  const fixedPlayerOffset: Offset = posToOffset(new_pos());

  const getBgOffset = useCallback(() => {
    const { x, y } = props.state.player.pos;
    return [x * -TILE_SIZE, y * -TILE_SIZE];
  }, [props.state.player.pos]);

  // Returns the offset to apply to other sprites on the board.
  // The camera is always centered on the player, so we need to adjust
  // how we render the other sprites on the board. They start at the
  // position corresponding to the current state, then are offset
  // by the player's current position.
  const getSpriteOffset = useCallback(
    (spritePos: Pos) => {
      const playerPos = props.state.player.pos;
      return {
        pos: spritePos,
        // left: `${pos.x * (TILE_SIZE + 1) + AXIS_WIDTH + 2}px`,
        // top: `${pos.y * (TILE_SIZE + 1) + AXIS_HEIGHT + 2}px`,
        top: `${
          (spritePos.y - playerPos.y) * (TILE_SIZE + 1) + AXIS_WIDTH + 2
        }px`,
        left: `${
          (spritePos.x - playerPos.x) * (TILE_SIZE + 1) + AXIS_WIDTH + 2
        }px`,
      } as Offset;
    },
    [props.state.player.pos]
  );

  // The css transition for the background image.
  const getCssTransition = useCallback(() => {
    if (!props.enableAnimations || props.state.player.anim_state === "idle") {
      return "none";
    }
    return `background-position ${CSS_ANIM_DURATION}s`;
  }, [props.enableAnimations, props.state.player.anim_state]);

  // Whether or not the other sprite positions should be animated.
  const shouldAnimSpritePos = useCallback(
    () => props.enableAnimations && props.state.player.anim_state !== "idle",
    [props.enableAnimations, props.state.player.anim_state]
  );

  return (
    <Box
      id="mini-board"
      overflow="hidden"
      minH="110px"
      width="400px"
      p={4}
      ml={3}
      bgImage={`url("${lunarSurfaceBgUrl}")`}
      bgPosition={`${getBgOffset()[0]}px ${getBgOffset()[1]}px`}
      transition={getCssTransition()}
      border="1px"
      borderColor="gray.800"
    >
      <Box position="relative">
        {(props.state.data_points as RDataPoint[]).map((gate, i) => (
          <DataPoint
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            offset={getSpriteOffset(gate.pos)}
            reading={gate.reading}
            animatePos={shouldAnimSpritePos()}
            enableHoverInfo={false}
            enableSfx={props.enableAnimations}
          />
        ))}
        <Player
          offset={fixedPlayerOffset}
          energy={props.state.player.energy}
          message={props.state.player.message}
          animState={props.state.player.anim_state}
          animData={props.state.player.anim_data}
          enableAnimations={props.enableAnimations}
          facing={props.state.player.facing}
          enableHoverInfo={false}
        />
      </Box>
    </Box>
  );
}
