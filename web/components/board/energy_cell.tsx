import { Box } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";
import { Offset } from "../../lib/utils";
import {
  TILE_SIZE,
  ENERGY_CELL_Z_INDEX,
  DEFAULT_ENERGY_CELL_GAIN,
} from "../../lib/constants";
import energyCellImgUrl from "../../images/board/energy_cell.png";
import SpriteLabel from "./sprite_label";
import EnergyCellPage from "./hover_info_pages/energy_cell.mdx";
import BoardHoverInfo from "./board_hover_info";

interface EnergyCellProps {
  offset: Offset;
  energyGain?: number;
  collected: boolean;
  enableHoverInfo: boolean;
}

export default function EnergyCell(props: EnergyCellProps) {
  return props.collected ? null : (
    <>
      {props.enableHoverInfo && !props.collected && (
        <BoardHoverInfo page={EnergyCellPage} offset={props.offset} />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={ENERGY_CELL_Z_INDEX}
      >
        <Box
          w={`${TILE_SIZE - 2}px`}
          h={`${TILE_SIZE - 2}px`}
          mt="1px"
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
            <img alt="energyCell" src={energyCellImgUrl} />
          </AnimateKeyframes>
          <SpriteLabel
            zIndex={ENERGY_CELL_Z_INDEX + 1}
            value={`+${props.energyGain}`}
          />
        </Box>
      </Box>
    </>
  );
}

EnergyCell.defaultProps = {
  energyGain: DEFAULT_ENERGY_CELL_GAIN,
};
