import { Box, Image } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";

import { useMemo } from "react";
import { ENERGY_CELL_Z_INDEX, REFLECTION_Z_INDEX } from "../../lib/constants";
import energyCellImgUrl from "../../images/board/energy_cell.png";
import {
  Offset,
  getTileSize,
  getDefaultSpriteDims,
} from "../../lib/board_utils";
import SpriteLabel from "./sprite_label";
import EnergyCellPage from "./hover_info_pages/energy_cell.mdx";
import BoardHoverInfo from "./board_hover_info";

const DEFAULT_ENERGY_CELL_GAIN = 10;

interface EnergyCellProps {
  offset: Offset;
  energyGain?: number;
  collected: boolean;
  enableHoverInfo: boolean;
  scale: number;
  filter?: string;
  showReflection?: boolean;
}

export default function EnergyCell(props: EnergyCellProps) {
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );

  return props.collected ? null : (
    <>
      {props.enableHoverInfo && !props.collected && (
        <BoardHoverInfo
          page={EnergyCellPage}
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
        zIndex={ENERGY_CELL_Z_INDEX}
        filter={props.filter}
      >
        <Box
          w="100%"
          h="100%"
          mt={`${spriteDims.marginTop}px`}
          ml={`${spriteDims.marginLeft}px`}
          zIndex={ENERGY_CELL_Z_INDEX}
        >
          <AnimateKeyframes
            keyframes={[
              {
                transform: "translateY(-3px)",
                filter: "drop-shadow(0px 13px 2px rgba(0, 0, 0, 0.3))",
              },
              {
                transform: "translateY(1px)",
                filter: "drop-shadow(0px 9px 2px rgba(0, 0, 0, 0.3))",
              },
            ]}
            play
            iterationCount="infinite"
            direction="alternate"
            duration={1.5}
            easeType="ease-in-out"
          >
            <Image
              src={energyCellImgUrl}
              w={`${spriteDims.width}px`}
              h={`${spriteDims.height}px`}
            />
          </AnimateKeyframes>
          <SpriteLabel
            zIndex={ENERGY_CELL_Z_INDEX + 1}
            value={`+${props.energyGain}`}
          />
        </Box>
        {props.showReflection && (
          <Box
            w="100%"
            h="100%"
            mt={`${spriteDims.marginTop}px`}
            ml={`${spriteDims.marginLeft}px`}
            position="absolute"
            top="62%"
            zIndex={REFLECTION_Z_INDEX}
          >
            <AnimateKeyframes
              keyframes={[
                {
                  transform: "translateY(3px) scaleY(-1)",
                },
                {
                  transform: "translateY(-1px) scaleY(-1)",
                },
              ]}
              play
              iterationCount="infinite"
              direction="alternate"
              duration={1.5}
              easeType="ease-in-out"
            >
              <Image
                src={energyCellImgUrl}
                w={`${spriteDims.width}px`}
                h={`${spriteDims.height}px`}
                style={{
                  opacity: 0.3,
                  filter: "blur(1px)",
                  maskImage: "linear-gradient(transparent 30%, black 90%)",
                }}
              />
            </AnimateKeyframes>
          </Box>
        )}
      </Box>
    </>
  );
}

EnergyCell.defaultProps = {
  energyGain: DEFAULT_ENERGY_CELL_GAIN,
};
