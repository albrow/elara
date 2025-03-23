import { Box, Image } from "@chakra-ui/react";

import { REFLECTION_Z_INDEX, SERVER_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import serverImgUrl from "../../images/board/server.png";
import { Offset } from "../../lib/board_utils";

interface ServerProps {
  offset: Offset;
  scale: number;
  filter?: string;
  showReflection?: boolean;
}

export default function Server(props: ServerProps) {
  return (
    <>
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
      {props.showReflection && (
        <Box
          position="absolute"
          left={props.offset.left}
          top={`${props.offset.topNum - 16 * props.scale + 64 * props.scale + 2}px`}
          w={`${48 * props.scale}px`}
          h={`${64 * props.scale}px`}
          zIndex={REFLECTION_Z_INDEX}
        >
          <Image
            src={serverImgUrl}
            w={`${48 * props.scale}px`}
            h={`${64 * props.scale}px`}
            position="absolute"
            style={{
              transform: "scaleY(-1)",
              opacity: 0.3,
              filter: "blur(1px)",
              maskImage: "linear-gradient(transparent 30%, black 90%)",
            }}
          />
        </Box>
      )}
    </>
  );
}
