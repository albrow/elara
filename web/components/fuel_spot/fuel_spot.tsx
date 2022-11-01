import { Offset } from "../../lib/utils";
import {
  TILE_SIZE,
  FUEL_Z_INDEX,
  DEFAULT_FUEL_GAIN,
} from "../../lib/constants";

interface FuelSpotProps {
  offset: Offset;
  fuel?: number;
}

export default function FuelSpot(props: FuelSpotProps) {
  const fuelAmount = props.fuel || DEFAULT_FUEL_GAIN;
  return (
    <div
      className="fuel sprite"
      style={{
        width: TILE_SIZE + "px",
        height: TILE_SIZE + "px",
        zIndex: FUEL_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    >
      <img className="fuelImage" src="/images/fuel.png" />
      <span
        className="fuelAmount text-white text-xs font-mono absolute bottom-0 right-0.5 drop-shadow-[0_0_1px_rgba(0,0,0,1.0)]"
        style={{ zIndex: FUEL_Z_INDEX + 1 }}
      >
        +{fuelAmount}
      </span>
    </div>
  );
}