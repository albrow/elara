import {
  FuzzyState,
  FuzzyPlayer,
  FuzzyGoal,
  FuzzyFuelSpot,
  FuzzyEnemy,
  FuzzyObstacle,
  FuzzyPasswordGate,
} from "../../../elara-lib/pkg";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  WIDTH,
  HEIGHT,
  AXIS_HEIGHT,
  AXIS_WIDTH,
} from "../../lib/constants";
import { range, posToOffset } from "../../lib/utils";
import Player from "./player";
import Goal from "./goal";
import FuelSpot from "./fuel_spot";
import Square from "./square";
import "./board.css";
import Enemy from "./enemy";
import Obstacle from "./obstacle";
import Gate from "./gate";

interface BoardProps {
  gameState: FuzzyState;
}

export default function Board(props: BoardProps) {
  return (
    <>
      <div id="board">
        <table
          style={{
            cursor: "crosshair",
            width: CANVAS_WIDTH + AXIS_WIDTH + 1 + "px",
            height: CANVAS_HEIGHT + AXIS_HEIGHT + 1 + "px",
          }}
        >
          <tbody>
            <tr
              id="x-axis-labels"
              style={{
                background: "white",
                fontSize: "var(--chakra-fontSizes-xs)",
                height: AXIS_HEIGHT + "px",
              }}
            >
              <th
                id="axis-spacer"
                style={{ width: AXIS_WIDTH + "px", height: AXIS_WIDTH + "px" }}
              ></th>
              {range(WIDTH).map((x) => (
                <th key={x} style={{ height: AXIS_HEIGHT + "px" }}>
                  {x}
                </th>
              ))}
            </tr>
            {range(HEIGHT).map((y) => (
              <tr key={y} className="row">
                <td
                  id="y-axis-label"
                  style={{
                    background: "white",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "var(--chakra-fontSizes-xs)",
                    width: AXIS_WIDTH + "px",
                  }}
                >
                  {y}
                </td>
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
            message={player.message}
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
      {(props.gameState.password_gates as FuzzyPasswordGate[]).map(
        (gate, i) => {
          return (
            <Gate
              key={i}
              offset={posToOffset(gate.pos)}
              open={gate.open}
              fuzzy={gate.fuzzy}
            />
          );
        }
      )}
    </>
  );
}
