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
      <div
        style={{
          position: "absolute",
          width: `${TILE_SIZE - 1}px`,
          height: `${TILE_SIZE - 1}px`,
          zIndex: ENERGY_POD_Z_INDEX,
          left: props.offset.left,
          top: props.offset.top,
        }}
      >
        <img alt="energyPod" src={energyPodImgUrl} />
        <SpriteLabel
          zIndex={ENERGY_POD_Z_INDEX + 1}
          value={`+${props.energyGain}`}
        />
      </div>
    </>
  );
}

EnergyPod.defaultProps = {
  energyGain: DEFAULT_ENERGY_POD_GAIN,
};
