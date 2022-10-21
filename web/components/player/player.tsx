import { Offset } from "../../lib/utils";
import { TILE_SIZE, PLAYER_Z_INDEX } from "../../lib/constants";

interface PlayerProps {
  offset: Offset;
  fuel: number;
}

export default function Player(props: PlayerProps) {
  return (
    <div
      className="player sprite"
      style={{
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        zIndex: PLAYER_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    >
      <img className="playerImage" src="/images/robot.png" />
      <span
        className="fuelCount text-white text-xs font-mono absolute bottom-0 right-0.5 drop-shadow-[0_0_1px_rgba(0,0,0,1.0)]"
        style={{ zIndex: PLAYER_Z_INDEX + 1 }}
      >
        {props.fuel}
      </span>
    </div>
  );
}
