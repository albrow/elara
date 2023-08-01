import { Box } from "@chakra-ui/react";
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

interface EnergyPodProps {
  offset: Offset;
  energyGain?: number;
  collected: boolean;
  enableHoverInfo: boolean;
}

export default function EnergyPod(props: EnergyPodProps) {
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
        <div
          style={{
            width: `${TILE_SIZE - 2}px`,
            height: `${TILE_SIZE - 2}px`,
            marginTop: "1px",
            zIndex: ENERGY_CELL_Z_INDEX,
            filter: "drop-shadow(-2px 3px 2px rgba(0, 0, 0, 0.3))",
          }}
        >
          <img alt="energyCell" src={energyCellImgUrl} />
          <SpriteLabel
            zIndex={ENERGY_CELL_Z_INDEX + 1}
            value={`+${props.energyGain}`}
          />
        </div>
      </Box>
    </>
  );
}

EnergyPod.defaultProps = {
  energyGain: DEFAULT_ENERGY_CELL_GAIN,
};
