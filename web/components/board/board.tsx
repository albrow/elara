import {
  FuzzyState,
  FuzzyPlayer,
  FuzzyGoal,
  FuzzyFuelSpot,
  FuzzyEnemy,
  FuzzyObstacle,
} from "../../../elara-lib/pkg";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  WIDTH,
  HEIGHT,
  WALL_Z_INDEX,
  BUG_Z_INDEX,
} from "../../lib/constants";
import { range, posToOffset } from "../../lib/utils";
import Player from "../player/player";
import Goal from "../goal/goal";
import FuelSpotCmpt from "../fuel_spot/fuel_spot";
import Square from "../square/square";
import bugImgUrl from "../../images/bug.png";
import rockImgUrl from "../../images/rock.png";
import "./board.css";

interface BoardProps {
  gameState: FuzzyState;
}

export default function Board(props: BoardProps) {
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
      {(props.gameState.players as FuzzyPlayer[]).map((player, i) => {
        const playerOffset = posToOffset(player.pos);
        return <Player key={i} offset={playerOffset} fuel={player.fuel} />;
      })}
      {(props.gameState.goals as FuzzyGoal[]).map((goal, i) => {
        return <Goal key={i} offset={posToOffset(goal.pos)} />;
      })}
      {(props.gameState.fuel_spots as FuzzyFuelSpot[]).map((fuel_spot, i) => {
        const fuelOffset = posToOffset(fuel_spot.pos);
        if (fuel_spot.collected) {
          return;
        }
        return <FuelSpotCmpt key={i} offset={fuelOffset} />;
      })}
      {(props.gameState.enemies as FuzzyEnemy[]).map((enemy, i) => {
        const enemyOffset = posToOffset(enemy.pos);
        return (
          <img
            className="bug sprite"
            src={bugImgUrl}
            key={i}
            style={{
              width: `${TILE_SIZE}px`,
              height: `${TILE_SIZE}px`,
              zIndex: BUG_Z_INDEX,
              left: enemyOffset.left,
              top: enemyOffset.top,
            }}
          />
        );
      })}
      {(props.gameState.obstacles as FuzzyObstacle[]).map((obstacle, i) => {
        const obsOffset = posToOffset(obstacle.pos);
        return (
          <img
            className="obstacle sprite"
            src={rockImgUrl}
            key={i}
            style={{
              width: `${TILE_SIZE}px`,
              height: `${TILE_SIZE}px`,
              zIndex: WALL_Z_INDEX,
              left: obsOffset.left,
              top: obsOffset.top,
            }}
          />
        );
      })}
    </>
  );
}
