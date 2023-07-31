import { Offset } from "../../lib/utils";
import { TILE_SIZE, GOAL_Z_INDEX } from "../../lib/constants";
import flagImgUrl from "../../images/board/flag.png";
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
      <img
        alt="goal"
        src={flagImgUrl}
        style={{
          position: "absolute",
          width: `${TILE_SIZE - 1}px`,
          height: `${TILE_SIZE - 1}px`,
          zIndex: GOAL_Z_INDEX,
          left: props.offset.left,
          top: props.offset.top,
        }}
      />
    </>
  );
}
