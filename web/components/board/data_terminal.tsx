import { Box, Spinner } from "@chakra-ui/react";

import { Offset } from "../../lib/utils";
import { TILE_SIZE, TERMINAL_Z_INDEX } from "../../lib/constants";
import tvImageUrl from "../../images/tv.png";

interface GateProps {
  offset: Offset;
  reading: boolean;
  fuzzy: boolean;
}

export default function Gate(props: GateProps) {
  return (
    <div
      className="gate sprite"
      style={{
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        zIndex: TERMINAL_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    >
      <img src={tvImageUrl} />

      {props.reading && (
        <Box position="absolute" left={3} top={2} zIndex={TERMINAL_Z_INDEX + 1}>
          <Spinner color="blue.400" thickness="4px" speed="0.65s" />
        </Box>
      )}
    </div>
  );
}
