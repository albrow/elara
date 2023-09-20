import { Box, Spinner, Image } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";

import {
  TILE_SIZE,
  CSS_ANIM_DURATION,
  DATA_POINT_Z_INDEX,
  SPRITE_DROP_SHADOW,
} from "../../lib/constants";
import dataPointImg from "../../images/board/data_point.png";
import { Offset } from "../../lib/utils";
import { useSoundManager } from "../../hooks/sound_manager_hooks";
import BoardHoverInfo from "./board_hover_info";
import DataPointPage from "./hover_info_pages/data_point.mdx";

interface DataPointProps {
  offset: Offset;
  reading: boolean;
  additionalInfo?: string;
  enableHoverInfo: boolean;
  // Whether to enable sound effects.
  enableSfx: boolean;
  // Wether or not the position property should be CSS animated (default false)
  animatePos?: boolean;
}

export default function DataPoint(props: DataPointProps) {
  const { getSound } = useSoundManager();
  const readingDataSound = useMemo(() => getSound("reading_data"), [getSound]);
  const getCssTransition = useCallback(() => {
    if (!props.animatePos) {
      return "none";
    }
    return `left ${CSS_ANIM_DURATION}s, top ${CSS_ANIM_DURATION}s`;
  }, [props.animatePos]);

  const stopMySoundEffects = useCallback(() => {
    readingDataSound.stop();
  }, [readingDataSound]);

  useEffect(
    () => () => {
      stopMySoundEffects();
    },
    [stopMySoundEffects]
  );

  useEffect(() => {
    if (props.reading && props.enableSfx) {
      readingDataSound.play();
    } else {
      stopMySoundEffects();
    }
  }, [props.enableSfx, props.reading, readingDataSound, stopMySoundEffects]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={DataPointPage}
          offset={props.offset}
          additionalInfo={props.additionalInfo}
        />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={DATA_POINT_Z_INDEX}
        filter={SPRITE_DROP_SHADOW}
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
          <Box
            position="absolute"
            left="19px"
            top="18.5px"
            zIndex={DATA_POINT_Z_INDEX + 1}
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

DataPoint.defaultProps = {
  animatePos: false,
};
