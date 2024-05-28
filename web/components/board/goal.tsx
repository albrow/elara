import { Image } from "@chakra-ui/react";

import { useMemo } from "react";
import flagImgUrl from "../../images/board/flag.png";
import { Offset, getDefaultSpriteDims } from "../../lib/board_utils";
import { GOAL_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import GoalPage from "./hover_info_pages/goal.mdx";
import BoardHoverInfo from "./board_hover_info";

interface GoalProps {
  offset: Offset;
  enableHoverInfo: boolean;
  scale: number;
}

export default function Goal(props: GoalProps) {
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={GoalPage}
          offset={props.offset}
          scale={props.scale}
        />
      )}
      <Image
        alt="goal"
        src={flagImgUrl}
        position="absolute"
        width={`${spriteDims.width}px`}
        height={`${spriteDims.height}px`}
        ml={`${spriteDims.marginLeft}px`}
        mt={`${spriteDims.marginTop}px`}
        zIndex={GOAL_Z_INDEX}
        left={props.offset.left}
        top={props.offset.top}
        filter={SPRITE_DROP_SHADOW}
      />
    </>
  );
}
