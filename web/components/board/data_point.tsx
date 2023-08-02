import { Box, Spinner } from "@chakra-ui/react";

import { useCallback } from "react";
import { Offset } from "../../lib/utils";
import {
  TILE_SIZE,
  TERMINAL_Z_INDEX,
  CSS_ANIM_DURATION,
} from "../../lib/constants";
import dataPointImg from "../../images/board/data_point.png";
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
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE - 1}px`}
        h={`${TILE_SIZE - 1}px`}
        zIndex={TERMINAL_Z_INDEX}
        filter="drop-shadow(-2px 3px 2px rgba(0, 0, 0, 0.3))"
        transition={getCssTransition()}
      >
        <img
          alt="dataPoint"
          src={dataPointImg}
          style={{
            width: `${TILE_SIZE - 2}px`,
            height: `${TILE_SIZE - 2}px`,
            marginTop: "1px",
            marginLeft: "1px",
          }}
        />
        {props.reading && (
          <Box
            position="absolute"
            left="19px"
            top="18.5px"
            zIndex={TERMINAL_Z_INDEX + 1}
          >
            <Spinner
              size="xs"
              color="green.400"
              thickness="2.5px"
              speed="0.65s"
            />
          </Box>
        )}
      </Box>
    </>
  );
}

DataTerminal.defaultProps = {
  animatePos: false,
};
