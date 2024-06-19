import { Image } from "@chakra-ui/react";

import { useMemo } from "react";
import { ROCK_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import rockImgUrl from "../../images/board/rock.png";
import { Offset, getDefaultSpriteDims } from "../../lib/board_utils";

interface RockProps {
  offset: Offset;
  scale: number;
}

export default function Rock(props: RockProps) {
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );

  return (
    <Image
      alt="rock"
      src={rockImgUrl}
      w={`${spriteDims.width}px`}
      h={`${spriteDims.height}px`}
      mt={`${spriteDims.marginTop}px`}
      ml={`${spriteDims.marginLeft}px`}
      position="absolute"
      left={props.offset.left}
      top={props.offset.top}
      zIndex={ROCK_Z_INDEX}
      filter={SPRITE_DROP_SHADOW}
    />
  );
}
