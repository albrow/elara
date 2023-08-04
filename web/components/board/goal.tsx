import { Image } from "@chakra-ui/react";

import flagImgUrl from "../../images/board/flag.png";
import { Offset } from "../../lib/utils";
import { GOAL_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import GoalPage from "./hover_info_pages/goal.mdx";
import BoardHoverInfo from "./board_hover_info";

interface GoalProps {
  offset: Offset;
  enableHoverInfo: boolean;
}

export default function Goal(props: GoalProps) {
  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo page={GoalPage} offset={props.offset} />
      )}
      <Image
        alt="goal"
        src={flagImgUrl}
        position="absolute"
        width="48px"
        height="48px"
        zIndex={GOAL_Z_INDEX}
        left={props.offset.left}
        top={props.offset.top}
        ml="1px"
        mt="1px"
        filter={SPRITE_DROP_SHADOW}
      />
    </>
  );
}
