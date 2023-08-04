import { Image } from "@chakra-ui/react";
import { useMemo } from "react";

import { posToOffset, rowBasedZIndex } from "../../lib/utils";
import { GOAL_Z_INDEX } from "../../lib/constants";
import flagImgUrl from "../../images/board/flag.png";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import GoalPage from "./hover_info_pages/goal.mdx";
import BoardHoverInfo from "./board_hover_info";

interface GoalProps {
  pos: Pos;
  enableHoverInfo: boolean;
}

export default function Goal(props: GoalProps) {
  const offset = useMemo(() => posToOffset(props.pos), [props.pos]);
  const zIndex = useMemo(
    () => rowBasedZIndex(props.pos.y, GOAL_Z_INDEX),
    [props.pos.y]
  );

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo page={GoalPage} offset={offset} />
      )}
      <Image
        alt="goal"
        src={flagImgUrl}
        position="absolute"
        width="48px"
        height="48px"
        zIndex={zIndex}
        left={offset.left}
        top={offset.top}
      />
    </>
  );
}
