import { Box } from "@chakra-ui/react";

import { useCallback } from "react";
import Player from "../board/player";
// eslint-disable-next-line camelcase
import { new_pos, FuzzyState } from "../../../elara-lib/pkg/elara_lib";
import { Offset } from "../../lib/utils";

import lunarSurfaceBgUrl from "../../images/lunar_surface_bg.png";
import { CSS_ANIM_DURATION } from "../../lib/constants";

export interface MiniBoardProps {
  state: FuzzyState;
}

export default function MiniBoard(props: MiniBoardProps) {
  const fixedPlayerOffset: Offset = {
    pos: new_pos(),
    top: "10px",
    left: "10px",
  };

  const getBgOffset = useCallback(() => {
    const player = props.state.players[0];
    const { x, y } = player.pos;
    return [x * -50, y * -50];
  }, [props.state.players]);

  const getCssTransition = useCallback(() => {
    if (props.state.players[0].anim_state === "idle") {
      return "none";
    }
    return `background-position ${CSS_ANIM_DURATION}s`;
  }, [props.state.players]);

  return (
    <Box
      id="mini-board"
      minH="110px"
      width={440}
      p={4}
      ml={3}
      bgImage={`url("${lunarSurfaceBgUrl}")`}
      bgPosition={`${getBgOffset()[0]}px ${getBgOffset()[1]}px`}
      transition={getCssTransition()}
      border="1px"
      borderColor="gray.800"
    >
      <Box position="relative">
        <Player
          offset={fixedPlayerOffset}
          fuel={props.state.players[0].fuel}
          message={props.state.players[0].message}
          animState={props.state.players[0].anim_state}
          facing={props.state.players[0].facing}
        />
      </Box>
    </Box>
  );
}
