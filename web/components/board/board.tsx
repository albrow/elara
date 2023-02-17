import {
  FuzzyDataTerminal,
  FuzzyEnemy,
  FuzzyFuelSpot,
  FuzzyGoal,
  FuzzyObstacle,
  FuzzyPasswordGate,
  FuzzyPlayer,
  FuzzyState,
} from "../../../elara-lib/pkg";
import {
  AXIS_HEIGHT,
  AXIS_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  HEIGHT,
  WIDTH,
} from "../../lib/constants";
import { posToOffset, range } from "../../lib/utils";
import "./board.css";
import lunarSurfaceBgUrl from "../../images/lunar_surface_bg.png";
import DataTerminal from "./data_terminal";
import Enemy from "./enemy";
import FuelSpot from "./fuel_spot";
import Gate from "./gate";
import Goal from "./goal";
import Obstacle from "./obstacle";
import Player from "./player";
import Square from "./square";

interface BoardProps {
  gameState: FuzzyState;
}

export default function Board(props: BoardProps) {
  return (
    <>
      <div
        id="board"
        style={{ backgroundImage: `url("${lunarSurfaceBgUrl}")` }}
      >
        <table
          style={{
            cursor: "crosshair",
            width: `${CANVAS_WIDTH + AXIS_WIDTH + 1}px`,
            height: `${CANVAS_HEIGHT + AXIS_HEIGHT + 1}px`,
          }}
        >
          <tbody>
            <tr
              id="x-axis-labels"
              style={{
                background: "white",
                fontSize: "var(--chakra-fontSizes-xs)",
                height: `${AXIS_HEIGHT}px`,
              }}
            >
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <th
                id="axis-spacer"
                style={{ width: `${AXIS_WIDTH}px`, height: `${AXIS_WIDTH}px` }}
              />
              {range(WIDTH).map((x) => (
                <th key={x} style={{ height: `${AXIS_HEIGHT}px` }}>
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
                    width: `${AXIS_WIDTH}px`,
                  }}
                >
                  {y}
                </td>
                {range(WIDTH).map((x) => (
                  <Square key={`${x},${y}`} x={x} y={y} />
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
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            offset={playerOffset}
            fuel={player.fuel}
            message={player.message}
            // fuzzy={player.fuzzy}
            animState={player.anim_state}
            facing={player.facing}
          />
        );
      })}
      {(props.gameState.goals as FuzzyGoal[]).map((goal, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Goal key={i} offset={posToOffset(goal.pos)} fuzzy={goal.fuzzy} />
      ))}
      {(props.gameState.fuel_spots as FuzzyFuelSpot[]).map((fuelSpot, i) => {
        const fuelOffset = posToOffset(fuelSpot.pos);
        return (
          <FuelSpot
            collected={fuelSpot.collected}
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            offset={fuelOffset}
            fuzzy={fuelSpot.fuzzy}
          />
        );
      })}
      {(props.gameState.enemies as FuzzyEnemy[]).map((enemy, i) => (
        <Enemy
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(enemy.pos)}
          fuzzy={enemy.fuzzy}
          animState={enemy.anim_state}
        />
      ))}
      {(props.gameState.obstacles as FuzzyObstacle[]).map((obstacle, i) => (
        <Obstacle
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(obstacle.pos)}
          fuzzy={obstacle.fuzzy}
        />
      ))}
      {(props.gameState.password_gates as FuzzyPasswordGate[]).map(
        (gate, i) => (
          <Gate
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            offset={posToOffset(gate.pos)}
            open={gate.open}
            // fuzzy={gate.fuzzy}
          />
        )
      )}
      {(props.gameState.data_terminals as FuzzyDataTerminal[]).map(
        (gate, i) => (
          <DataTerminal
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            offset={posToOffset(gate.pos)}
            reading={gate.reading}
            // fuzzy={gate.fuzzy}
          />
        )
      )}
    </>
  );
}
