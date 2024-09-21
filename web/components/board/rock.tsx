import { Box, Image } from "@chakra-ui/react";

import { useMemo } from "react";
import { ROCK_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import rockImgUrl from "../../images/board/rock.png";
import {
  Offset,
  getDefaultSpriteDims,
  getTileSize,
} from "../../lib/board_utils";

interface RockProps {
  offset: Offset;
  scale: number;
  filter?: string;
}

export default function Rock(props: RockProps) {
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);

  return (
    <Box
      position="absolute"
      left={props.offset.left}
      top={props.offset.top}
      w={`${tileSize}px`}
      h={`${tileSize}px`}
      zIndex={ROCK_Z_INDEX}
      filter={props.filter}
    >
      <Image
        src={rockImgUrl}
        w={`${spriteDims.width}px`}
        h={`${spriteDims.height}px`}
        mt={`${spriteDims.marginTop}px`}
        ml={`${spriteDims.marginLeft}px`}
        filter={SPRITE_DROP_SHADOW}
      />
    </Box>
  );
}
