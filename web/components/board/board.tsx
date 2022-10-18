import { Pos, State } from "../../lib/state";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  WIDTH,
  HEIGHT,
} from "../../lib/constants";
import { range } from "../../lib/utils";
import "./board.css";

const PLAYER_Z_INDEX = 200;
const FUEL_Z_INDEX = 100;

interface Offset {
  top: string;
  left: string;
}

function posToOffset(pos: Pos): Offset {
  return {
    left: `${pos.y * (TILE_SIZE + 1) + 1}px`,
    top: `${pos.x * (TILE_SIZE + 1) + 1}px`,
  };
}

interface BoardProps {
  gameState: State;
}

export default function Board(props: BoardProps) {
  const playerOffset = posToOffset(props.gameState.player.pos);

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
      <img
        className="player"
        src="/images/robot.png"
        style={{
          width: `${TILE_SIZE}px`,
          height: `${TILE_SIZE}px`,
          zIndex: PLAYER_Z_INDEX,
          left: playerOffset.left,
          top: playerOffset.top,
        }}
      />
      {props.gameState.fuel.map((fuel, i) => {
        const fuelOffset = posToOffset(fuel.pos);
        return (
          <img
            key={i}
            className="fuel"
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
