import { Box, Image } from "@chakra-ui/react";

import { SERVER_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import serverImgUrl from "../../images/board/server.png";
import { Offset } from "../../lib/board_utils";

interface ServerProps {
  offset: Offset;
  scale: number;
  filter?: string;
}

export default function Server(props: ServerProps) {
  return (
    <Box
      position="absolute"
      left={props.offset.left}
      top={`${props.offset.topNum - 16 * props.scale}px`}
      // Note: We're using non-default sprite dimensions because the server sprite
      // is taller than the default.
      w={`${48 * props.scale}px`}
      h={`${64 * props.scale}px`}
      zIndex={SERVER_Z_INDEX}
      filter={props.filter}
    >
      <Image
        src={serverImgUrl}
        // Note: We're using non-default sprite dimensions because the server sprite
        // is taller than the default.
        w={`${48 * props.scale}px`}
        h={`${64 * props.scale}px`}
        position="absolute"
        zIndex={SERVER_Z_INDEX}
        filter={SPRITE_DROP_SHADOW}
      />
    </Box>
  );
}
