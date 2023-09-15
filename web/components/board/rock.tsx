import { Image } from "@chakra-ui/react";

import { ROCK_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import rockImgUrl from "../../images/board/rock.png";
import { Offset } from "../../lib/utils";

interface RockProps {
  offset: Offset;
}

export default function Rock(props: RockProps) {
  return (
    <Image
      alt="rock"
      src={rockImgUrl}
      w="48px"
      h="48px"
      position="absolute"
      left={props.offset.left}
      top={props.offset.top}
      zIndex={ROCK_Z_INDEX}
      filter={SPRITE_DROP_SHADOW}
    />
  );
}
