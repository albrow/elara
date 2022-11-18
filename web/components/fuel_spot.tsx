import { Offset } from "../lib/utils";
import { TILE_SIZE, FUEL_Z_INDEX, DEFAULT_FUEL_GAIN } from "../lib/constants";
import fuelImgUrl from "../images/fuel.png";
import glitchyFuelImgUrl from "../images/fuel_glitchy.gif";

interface FuelSpotProps {
  offset: Offset;
  fuel?: number;
  fuzzy: boolean;
}

export default function FuelSpot(props: FuelSpotProps) {
  const fuelAmount = props.fuel || DEFAULT_FUEL_GAIN;
  return (
    <div
      className="fuel sprite"
      style={{
        width: `${TILE_SIZE - 1}px`,
        height: `${TILE_SIZE - 1}px`,
        zIndex: FUEL_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    >
      <img
        className="fuelImage"
        src={props.fuzzy ? glitchyFuelImgUrl : fuelImgUrl}
      />
      <span
        className="fuelAmount text-white text-xs font-mono absolute bottom-0 right-0.5 drop-shadow-[0_0_1px_rgba(0,0,0,1.0)]"
        style={{ zIndex: FUEL_Z_INDEX + 1 }}
      >
        +{fuelAmount}
      </span>
    </div>
  );
}
