import { Box } from "@chakra-ui/react";
import { MdNorth, MdSouth, MdWest, MdEast } from "react-icons/md";

import { useCallback } from "react";
import Player from "../board/player";
// eslint-disable-next-line camelcase
import { new_pos, FuzzyState } from "../../../elara-lib/pkg/elara_lib";
import { Offset } from "../../lib/utils";

export interface MiniBoardProps {
  state: FuzzyState;
}

export default function MiniBoard(props: MiniBoardProps) {
  const fixedPlayerOffset: Offset = {
    pos: new_pos(),
    top: "10px",
    left: "10px",
  };

  const directionalArrow = useCallback((animState: string) => {
    switch (animState) {
      case "move_up":
        return (
          <Box position="absolute" top="-9px" left="26px">
            <MdNorth />
          </Box>
        );
      case "move_down":
        return (
          <Box position="absolute" top="59px" left="26px">
            <MdSouth />
          </Box>
        );
      case "move_right":
        return (
          <Box position="absolute" top="26px" left="59px">
            <MdEast />
          </Box>
        );
      case "move_left":
        return (
          <Box position="absolute" top="26px" left="-9px">
            <MdWest />
          </Box>
        );
      default:
        return null;
    }
  }, []);

  return (
    <Box
      id="mini-board"
      minH="110px"
      width={410}
      p={4}
      ml={3}
      bg="gray.300"
      border="1px"
      borderColor="gray.800"
    >
      <Box position="relative">
        <Player
          offset={fixedPlayerOffset}
          fuel={props.state.players[0].fuel}
          fuzzy={false}
          message={props.state.players[0].message}
        />
        {directionalArrow(props.state.players[0].anim_state)}
      </Box>
    </Box>
  );
}
