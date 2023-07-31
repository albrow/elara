import { Box } from "@chakra-ui/react";
import { Offset } from "../../lib/utils";
import {
  TILE_SIZE,
  ENERGY_POD_Z_INDEX,
  DEFAULT_ENERGY_POD_GAIN,
} from "../../lib/constants";
import energyPodImgUrl from "../../images/board/energy_pod.png";
import SpriteLabel from "./sprite_label";
import EnergyPodPage from "./hover_info_pages/energy_pod.mdx";
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
        <BoardHoverInfo page={EnergyPodPage} offset={props.offset} />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={ENERGY_POD_Z_INDEX}
      >
        <div
          style={{
            width: `${TILE_SIZE - 2}px`,
            height: `${TILE_SIZE - 2}px`,
            marginTop: "1px",
            zIndex: ENERGY_POD_Z_INDEX,
            filter: "drop-shadow(-2px 3px 2px rgba(0, 0, 0, 0.3))",
          }}
        >
          <img alt="energyPod" src={energyPodImgUrl} />
          <SpriteLabel
            zIndex={ENERGY_POD_Z_INDEX + 1}
            value={`+${props.energyGain}`}
          />
        </div>
      </Box>
    </>
  );
}

EnergyPod.defaultProps = {
  energyGain: DEFAULT_ENERGY_POD_GAIN,
};
