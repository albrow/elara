import { Image } from "@chakra-ui/react";

import { SERVER_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import serverImgUrl from "../../images/board/server.png";
import { Offset } from "../../lib/utils";

interface ServerProps {
  offset: Offset;
}

export default function Server(props: ServerProps) {
  return (
    <Image
      alt="server"
      src={serverImgUrl}
      w="48px"
      h="64px"
      position="absolute"
      left={props.offset.left}
      top={`${props.offset.topNum - 16}px`}
      zIndex={SERVER_Z_INDEX}
      filter={SPRITE_DROP_SHADOW}
    />
  );
}
