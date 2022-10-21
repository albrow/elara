// import { Pos, State } from "../../lib/state";

import { FuelSpot, State } from "../../../elara-lib/pkg";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  WIDTH,
  HEIGHT,
  FUEL_Z_INDEX,
  GOAL_Z_INDEX,
} from "../../lib/constants";
import { range, posToOffset } from "../../lib/utils";
import Player from "../player/player";
import "./board.css";

interface BoardProps {
  gameState: State;
}

export default function Board(props: BoardProps) {
  const playerOffset = posToOffset(props.gameState.player.pos);
  const goalOffset = posToOffset(props.gameState.goal.pos);

  return (
    <>
      <div id="board">
        <table
          className="table-fixed"
          style={{ width: CANVAS_WIDTH + "px", height: CANVAS_HEIGHT + "px" }}
        >
          <tbody>
            {range(HEIGHT).map((y) => (
              <tr key={y} className="row">
                {range(WIDTH).map((x) => (
                  <td key={x} className="square"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Player offset={playerOffset} fuel={props.gameState.player.fuel} />
      <img
        className="flag sprite"
        src="/images/flag.png"
        style={{
          width: `${TILE_SIZE}px`,
          height: `${TILE_SIZE}px`,
          zIndex: GOAL_Z_INDEX,
          left: goalOffset.left,
          top: goalOffset.top,
        }}
      />
      {(props.gameState.fuel_spots as FuelSpot[]).map((fuel_spot, i) => {
        const fuelOffset = posToOffset(fuel_spot.pos);
        if (fuel_spot.collected) {
          return;
        }
        return (
          <img
            key={i}
            className="fuel sprite"
            src="/images/fuel.png"
            style={{
              width: TILE_SIZE + "px",
              height: TILE_SIZE + "px",
              zIndex: FUEL_Z_INDEX,
              left: fuelOffset.left,
              top: fuelOffset.top,
            }}
          />
        );
      })}
    </>
  );
}
