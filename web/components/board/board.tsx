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
  WIDTH,
  HEIGHT,
} from "../../lib/constants";
import { range, posToOffset } from "../../lib/utils";
import Player from "../player/player";
import Goal from "../goal/goal";
import FuelSpot from "../fuel_spot/fuel_spot";
import Square from "../square/square";
import "./board.css";
import Enemy from "../enemy/enemy";
import Obstacle from "../obstacle/obstacle";

interface BoardProps {
  gameState: FuzzyState;
}

export default function Board(props: BoardProps) {
  return (
    <>
      <div id="board">
        <table
          className="table-fixed cursor-crosshair"
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
        return (
          <Player
            key={i}
            offset={playerOffset}
            fuel={player.fuel}
            fuzzy={player.fuzzy}
          />
        );
      })}
      {(props.gameState.goals as FuzzyGoal[]).map((goal, i) => {
        return (
          <Goal key={i} offset={posToOffset(goal.pos)} fuzzy={goal.fuzzy} />
        );
      })}
      {(props.gameState.fuel_spots as FuzzyFuelSpot[]).map((fuel_spot, i) => {
        const fuelOffset = posToOffset(fuel_spot.pos);
        if (fuel_spot.collected) {
          return;
        }
        return <FuelSpot key={i} offset={fuelOffset} fuzzy={fuel_spot.fuzzy} />;
      })}
      {(props.gameState.enemies as FuzzyEnemy[]).map((enemy, i) => {
        return (
          <Enemy key={i} offset={posToOffset(enemy.pos)} fuzzy={enemy.fuzzy} />
        );
      })}
      {(props.gameState.obstacles as FuzzyObstacle[]).map((obstacle, i) => {
        return (
          <Obstacle
            key={i}
            offset={posToOffset(obstacle.pos)}
            fuzzy={obstacle.fuzzy}
          />
        );
      })}
    </>
  );
}
