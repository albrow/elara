import { Box, Spinner, Image } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";

import {
  CSS_ANIM_DURATION,
  DATA_POINT_Z_INDEX,
  REFLECTION_Z_INDEX,
  SPRITE_DROP_SHADOW,
} from "../../lib/constants";
import dataPointImg from "../../images/board/data_point.png";
import {
  Offset,
  getTileSize,
  getDefaultSpriteDims,
} from "../../lib/board_utils";
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
  scale: number;
  filter?: string;
  showReflection?: boolean;
}

export default function DataPoint(props: DataPointProps) {
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );

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
          scale={props.scale}
        />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${tileSize}px`}
        h={`${tileSize}px`}
        zIndex={DATA_POINT_Z_INDEX}
        filter={props.filter}
        transition={getCssTransition()}
      >
        <Image
          src={dataPointImg}
          w={`${spriteDims.width}px`}
          h={`${spriteDims.height}px`}
          mt={`${spriteDims.marginTop}px`}
          ml={`${spriteDims.marginLeft}px`}
          filter={SPRITE_DROP_SHADOW}
        />
        {props.showReflection && (
          <Image
            src={dataPointImg}
            w={`${spriteDims.width}px`}
            h={`${spriteDims.height}px`}
            mt={`${spriteDims.marginTop}px`}
            ml={`${spriteDims.marginLeft}px`}
            position="absolute"
            top="72%"
            zIndex={REFLECTION_Z_INDEX}
            style={{
              transform: "scaleY(-1)",
              opacity: 0.3,
              filter: "blur(1px)",
              maskImage: "linear-gradient(transparent 30%, black 90%)",
            }}
          />
        )}
        {props.reading && (
          <Box
            position="absolute"
            left="38%"
            top="36%"
            zIndex={DATA_POINT_Z_INDEX + 1}
            style={{
              transform: `scale(${props.scale})`,
              transformOrigin: "top left",
            }}
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
