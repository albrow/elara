import { Image } from "@chakra-ui/react";

import { SERVER_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import serverImgUrl from "../../images/board/server.png";
import { Offset } from "../../lib/board_utils";

interface ServerProps {
  offset: Offset;
  scale: number;
}

export default function Server(props: ServerProps) {
  return (
    <Image
      alt="server"
      src={serverImgUrl}
      // Note: We're using non-default sprite dimensions because the server sprite
      // is taller than the default.
      w={`${48 * props.scale}px`}
      h={`${64 * props.scale}px`}
      position="absolute"
      left={props.offset.left}
      top={`${props.offset.topNum - 16 * props.scale}px`}
      zIndex={SERVER_Z_INDEX}
      filter={SPRITE_DROP_SHADOW}
    />
  );
}
