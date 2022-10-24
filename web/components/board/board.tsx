import { State, FuelSpot, Obstacle } from "../../../elara-lib/pkg";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  WIDTH,
  HEIGHT,
  GOAL_Z_INDEX,
} from "../../lib/constants";
import { range, posToOffset } from "../../lib/utils";
import Player from "../player/player";
import FuelSpotCmpt from "../fuel_spot/fuel_spot";
import Square from "../square/square";
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
                  <Square key={"" + x + "," + y} x={x} y={y} />
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
        return <FuelSpotCmpt key={i} offset={fuelOffset} />;
      })}
      {(props.gameState.obstacles as Obstacle[]).map((obstacle, i) => {
        const obsOffset = posToOffset(obstacle.pos);
        return (
          <img
            className="obstacle sprite"
            src="/images/rock.png"
            key={i}
            style={{
              width: `${TILE_SIZE}px`,
              height: `${TILE_SIZE}px`,
              zIndex: GOAL_Z_INDEX,
              left: obsOffset.left,
              top: obsOffset.top,
            }}
          />
        );
      })}
    </>
  );
}
