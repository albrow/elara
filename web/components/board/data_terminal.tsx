import { Box, Spinner } from "@chakra-ui/react";

import { useCallback } from "react";
import { Offset } from "../../lib/utils";
import {
  TILE_SIZE,
  TERMINAL_Z_INDEX,
  CSS_ANIM_DURATION,
} from "../../lib/constants";
import tvImageUrl from "../../images/tv.png";
import BoardHoverInfo from "./board_hover_info";
import DataTerminalPage from "./hover_info_pages/data_terminal.mdx";

interface DataTerminalProps {
  offset: Offset;
  reading: boolean;
  additionalInfo?: string;
  // Wether or not the position property should be CSS animated (default false)
  animatePos?: boolean;
  enableHoverInfo: boolean;
}

export default function DataTerminal(props: DataTerminalProps) {
  const getCssTransition = useCallback(() => {
    if (!props.animatePos) {
      return "none";
    }
    return `left ${CSS_ANIM_DURATION}s, top ${CSS_ANIM_DURATION}s`;
  }, [props.animatePos]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={DataTerminalPage}
          offset={props.offset}
          additionalInfo={props.additionalInfo}
        />
      )}
      <div
        style={{
          position: "absolute",
          width: `${TILE_SIZE - 1}px`,
          height: `${TILE_SIZE - 1}px`,
          zIndex: TERMINAL_Z_INDEX,
          left: props.offset.left,
          top: props.offset.top,
          transition: getCssTransition(),
        }}
      >
        <img src={tvImageUrl} alt="data terminal" />

        {props.reading && (
          <Box
            position="absolute"
            left={3}
            top={2}
            zIndex={TERMINAL_Z_INDEX + 1}
          >
            <Spinner color="blue.400" thickness="4px" speed="0.65s" />
          </Box>
        )}
      </div>
    </>
  );
}

DataTerminal.defaultProps = {
  animatePos: false,
};
