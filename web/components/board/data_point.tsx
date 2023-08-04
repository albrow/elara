import { Box, Spinner, Image } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";

import { posToOffset, rowBasedZIndex } from "../../lib/utils";
import {
  TILE_SIZE,
  DATA_POINT_Z_INDEX,
  CSS_ANIM_DURATION,
} from "../../lib/constants";
import dataPointImg from "../../images/board/data_point.png";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import BoardHoverInfo from "./board_hover_info";
import DataPointPage from "./hover_info_pages/data_point.mdx";

interface DataPointProps {
  pos: Pos;
  reading: boolean;
  additionalInfo?: string;
  // Wether or not the position property should be CSS animated (default false)
  animatePos?: boolean;
  enableHoverInfo: boolean;
}

export default function DataPoint(props: DataPointProps) {
  const getCssTransition = useCallback(() => {
    if (!props.animatePos) {
      return "none";
    }
    return `left ${CSS_ANIM_DURATION}s, top ${CSS_ANIM_DURATION}s`;
  }, [props.animatePos]);

  const offset = useMemo(() => posToOffset(props.pos), [props.pos]);
  const zIndex = useMemo(
    () => rowBasedZIndex(props.pos.y, DATA_POINT_Z_INDEX),
    [props.pos.y]
  );

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={DataPointPage}
          offset={offset}
          additionalInfo={props.additionalInfo}
        />
      )}
      <Box
        position="absolute"
        left={offset.left}
        top={offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={zIndex}
        filter="drop-shadow(-2px 3px 2px rgba(0, 0, 0, 0.3))"
        transition={getCssTransition()}
      >
        <Image
          alt="dataPoint"
          src={dataPointImg}
          w="48px"
          h="48px"
          mt="1px"
          ml="1px"
        />
        {props.reading && (
          <Box position="absolute" left="19px" top="18.5px" zIndex={zIndex + 1}>
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

DataPoint.defaultProps = {
  animatePos: false,
};
