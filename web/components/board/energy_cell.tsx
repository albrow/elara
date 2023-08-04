import { Box, Image } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";
import { useMemo } from "react";

import {
  TILE_SIZE,
  ENERGY_CELL_Z_INDEX,
  DEFAULT_ENERGY_CELL_GAIN,
} from "../../lib/constants";
import energyCellImgUrl from "../../images/board/energy_cell.png";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import { posToOffset, rowBasedZIndex } from "../../lib/utils";
import SpriteLabel from "./sprite_label";
import EnergyCellPage from "./hover_info_pages/energy_cell.mdx";
import BoardHoverInfo from "./board_hover_info";

interface EnergyCellProps {
  pos: Pos;
  energyGain?: number;
  collected: boolean;
  enableHoverInfo: boolean;
}

export default function EnergyCell(props: EnergyCellProps) {
  const offset = useMemo(() => posToOffset(props.pos), [props.pos]);
  const zIndex = useMemo(
    () => rowBasedZIndex(props.pos.y, ENERGY_CELL_Z_INDEX),
    [props.pos.y]
  );

  return props.collected ? null : (
    <>
      {props.enableHoverInfo && !props.collected && (
        <BoardHoverInfo page={EnergyCellPage} offset={offset} />
      )}
      <Box
        position="absolute"
        left={offset.left}
        top={offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={zIndex}
      >
        <Box
          w={`${TILE_SIZE - 2}px`}
          h={`${TILE_SIZE - 2}px`}
          mt="1px"
          zIndex={zIndex}
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
            <Image alt="energyCell" src={energyCellImgUrl} w="48px" h="48px" />
          </AnimateKeyframes>
          <SpriteLabel zIndex={zIndex + 1} value={`+${props.energyGain}`} />
        </Box>
      </Box>
    </>
  );
}

EnergyCell.defaultProps = {
  energyGain: DEFAULT_ENERGY_CELL_GAIN,
};
