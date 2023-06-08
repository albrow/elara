import { Offset } from "../../lib/utils";
import {
  TILE_SIZE,
  FUEL_Z_INDEX,
  DEFAULT_FUEL_GAIN,
} from "../../lib/constants";
import fuelImgUrl from "../../images/fuel.png";
import glitchyFuelImgUrl from "../../images/fuel_glitchy.gif";
import SpriteLabel from "./sprite_label";
import FuelSpotPage from "./hover_info_pages/fuel_spot.mdx";
import BoardHoverInfo from "./board_hover_info";

interface FuelSpotProps {
  offset: Offset;
  fuel?: number;
  collected: boolean;
  fuzzy: boolean;
}

export default function FuelSpot(props: FuelSpotProps) {
  const fuelAmount = props.fuel || DEFAULT_FUEL_GAIN;
  return props.collected ? null : (
    <>
      <BoardHoverInfo page={FuelSpotPage} offset={props.offset} />
      <div
        style={{
          position: "absolute",
          width: `${TILE_SIZE - 1}px`,
          height: `${TILE_SIZE - 1}px`,
          zIndex: FUEL_Z_INDEX,
          left: props.offset.left,
          top: props.offset.top,
        }}
      >
        <img
          className="fuelImage"
          alt="fuel"
          src={props.fuzzy ? glitchyFuelImgUrl : fuelImgUrl}
        />
        <SpriteLabel zIndex={FUEL_Z_INDEX + 1} value={`+${fuelAmount}`} />
      </div>
    </>
  );
}
