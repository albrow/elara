import { Box, Image } from "@chakra-ui/react";

import { useMemo } from "react";
import flagImgUrl from "../../images/board/flag.png";
import {
  Offset,
  getDefaultSpriteDims,
  getTileSize,
} from "../../lib/board_utils";
import { GOAL_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import GoalPage from "./hover_info_pages/goal.mdx";
import BoardHoverInfo from "./board_hover_info";

interface GoalProps {
  offset: Offset;
  enableHoverInfo: boolean;
  scale: number;
  filter?: string;
}

export default function Goal(props: GoalProps) {
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={GoalPage}
          offset={props.offset}
          scale={props.scale}
        />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${tileSize}px`}
        h={`${tileSize}px`}
        zIndex={GOAL_Z_INDEX}
        filter={props.filter}
      >
        <Image
          src={flagImgUrl}
          width={`${spriteDims.width}px`}
          height={`${spriteDims.height}px`}
          ml={`${spriteDims.marginLeft}px`}
          mt={`${spriteDims.marginTop}px`}
          filter={SPRITE_DROP_SHADOW}
        />
      </Box>
    </>
  );
}
