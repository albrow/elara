import { Box } from "@chakra-ui/react";

import {
  FuzzyDataTerminal,
  FuzzyEnemy,
  FuzzyEnergyCell,
  FuzzyGoal,
  FuzzyObstacle,
  FuzzyPasswordGate,
  FuzzyPlayer,
  FuzzyState,
  FuzzyTelepad,
  FuzzyButton,
  FuzzyGate,
} from "../../../elara-lib/pkg";
import {
  AXIS_HEIGHT,
  AXIS_WIDTH,
  HEIGHT,
  TILE_SIZE,
  WIDTH,
} from "../../lib/constants";
import { Offset, posToOffset, range } from "../../lib/utils";
import "./board.css";
import lunarSurfaceBgUrl from "../../images/board/lunar_surface_bg.png";
import DataTerminal from "./data_point";
import Enemy from "./enemy";
import EnergyCell from "./energy_cell";
import PasswordGate from "./password_gate";
import Goal from "./goal";
import Obstacle from "./obstacle";
import Player from "./player";
import Telepad from "./telepad";
import Button from "./button";
import Gate from "./gate";

interface BoardProps {
  gameState: FuzzyState;
  enableAnimations: boolean;
  enableHoverInfo: boolean;
}

// Returns the offset for whatever the button is connected to.
function getConnectionOffset(
  state: FuzzyState,
  buttonIndex: number
): Offset | null {
  if (buttonIndex >= state.buttons.length) {
    throw new Error(`Button index ${buttonIndex} is out of range.`);
  }
  const button = state.buttons[buttonIndex];
  switch (button.connection_type) {
    case "gate":
      if (button.connection_index >= state.gates.length) {
        throw new Error(
          `Gate index ${button.connection_index} is out of range.`
        );
      }
      return posToOffset(state.gates[button.connection_index].pos);
    default:
      return null;
  }
}

export default function Board(props: BoardProps) {
  return (
    <>
      <div
        id="board"
        style={{
          backgroundImage: `url("${lunarSurfaceBgUrl}")`,
        }}
      >
        <table
          style={{
            width: `${AXIS_WIDTH + TILE_SIZE * WIDTH + 1}px`,
            height: `${AXIS_HEIGHT + TILE_SIZE * HEIGHT + 2}px`,
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
                {/* {range(WIDTH).map((x) => (
                  <Square key={`${x},${y}`} x={x} y={y} />
                ))} */}
                {range(WIDTH).map((x) => (
                  <td key={`${x},${y}`} />
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
            energy={player.energy}
            message={player.message}
            animState={player.anim_state}
            animData={player.anim_data}
            facing={player.facing}
            enableAnimations={props.enableAnimations}
            enableHoverInfo={props.enableHoverInfo}
          />
        );
      })}
      {(props.gameState.goals as FuzzyGoal[]).map((goal, i) => (
        <Goal
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(goal.pos)}
          enableHoverInfo={props.enableHoverInfo}
        />
      ))}
      {(props.gameState.energy_cells as FuzzyEnergyCell[]).map(
        (energyCell, i) => {
          const cellOffset = posToOffset(energyCell.pos);
          return (
            <EnergyCell
              collected={energyCell.collected}
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              offset={cellOffset}
              enableHoverInfo={props.enableHoverInfo}
            />
          );
        }
      )}
      {(props.gameState.enemies as FuzzyEnemy[]).map((enemy, i) => (
        <Enemy
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(enemy.pos)}
          facing={enemy.facing}
          enableAnimations={props.enableAnimations}
          animState={enemy.anim_state}
          animData={enemy.anim_data}
          enableHoverInfo={props.enableHoverInfo}
        />
      ))}
      {(props.gameState.obstacles as FuzzyObstacle[]).map((obstacle, i) => (
        <Obstacle
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(obstacle.pos)}
          fuzzy={obstacle.fuzzy}
          enableHoverInfo={props.enableHoverInfo}
        />
      ))}
      {(props.gameState.buttons as FuzzyButton[]).map((button, i) => (
        <Button
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(button.pos)}
          currentlyPressed={button.currently_pressed}
          connectionOffset={getConnectionOffset(props.gameState, i)}
          additionalInfo={button.additional_info}
          enableAnimations={props.enableAnimations}
          enableHoverInfo={props.enableHoverInfo}
        />
      ))}
      {(props.gameState.gates as FuzzyGate[]).map((gate, i) => (
        <Gate
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(gate.pos)}
          open={gate.open}
          additionalInfo={gate.additional_info}
          enableHoverInfo={props.enableHoverInfo}
        />
      ))}
      {(props.gameState.password_gates as FuzzyPasswordGate[]).map(
        (gate, i) => (
          <PasswordGate
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            offset={posToOffset(gate.pos)}
            open={gate.open}
            additionalInfo={gate.additional_info}
            enableHoverInfo={props.enableHoverInfo}
          />
        )
      )}
      {(props.gameState.data_terminals as FuzzyDataTerminal[]).map(
        (terminal, i) => (
          <DataTerminal
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            offset={posToOffset(terminal.pos)}
            reading={terminal.reading}
            additionalInfo={terminal.additional_info}
            enableHoverInfo={props.enableHoverInfo}
          />
        )
      )}
      {(props.gameState.telepads as FuzzyTelepad[]).map((telepad, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Box key={i}>
          <Telepad
            // eslint-disable-next-line react/no-array-index-key
            key={`entrance_${i}`}
            offset={posToOffset(telepad.start_pos)}
            kind="entrance"
            telepadIndex={i}
            enableHoverInfo={props.enableHoverInfo}
          />
          <Telepad
            // eslint-disable-next-line react/no-array-index-key
            key={`exit_${i}`}
            offset={posToOffset(telepad.end_pos)}
            kind="exit"
            telepadIndex={i}
            enableHoverInfo={props.enableHoverInfo}
          />
        </Box>
      ))}
    </>
  );
}
