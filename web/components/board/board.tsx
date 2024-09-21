import { Box } from "@chakra-ui/react";
import { useMemo } from "react";

import {
  DataPoint as RDataPoint,
  Enemy as REnemy,
  EnergyCell as REnergyCell,
  Goal as RGoal,
  Obstacle as RObstacle,
  PasswordGate as RPasswordGate,
  State as RState,
  Telepad as RTelepad,
  Button as RButton,
  Gate as RGate,
  BigEnemy as RBigEnemy,
  AsteroidWarning as RAsteroidWarning,
  Crate as RCrate,
} from "../../../elara-lib/pkg";
import { range } from "../../lib/utils";
import {
  WIDTH,
  HEIGHT,
  getBoardDimensions,
  posToOffset,
  AXIS_HEIGHT,
  AXIS_WIDTH,
} from "../../lib/board_utils";
import "./board.css";
import lunarSurfaceBgUrl from "../../images/board/lunar_surface_bg.jpg";
import DataPoint from "./data_point";
import Enemy from "./enemy";
import EnergyCell from "./energy_cell";
import PasswordGate from "./password_gate";
import Goal from "./goal";
import Rock from "./rock";
import Asteroid from "./asteroid";
import Server from "./server";
import Player from "./player";
import Telepad from "./telepad";
import Button from "./button";
import Gate from "./gate";
import BigEnemy from "./big_enemy";
import AsteroidWarning from "./asteroid_warning";
import Crate from "./crate";

interface BoardProps {
  gameState: RState;
  asteroidWarnings: RAsteroidWarning[];
  enableAnimations: boolean;
  enableHoverInfo: boolean;
  // Whether or not to show the initial, pre-run state of the board.
  // E.g., this includes whether or not to show asteroid warnings.
  showInitialState: boolean;
  // How much to scale the size of the board up or down.
  // 1 = normal size, 2 = double size, 0.5 = half size, etc.
  scale: number;
  // A CSS filter to apply to the board.
  // E.g., "grayscale(100%)"
  filter?: string;
}

export default function Board(props: BoardProps) {
  const boardDims = useMemo(
    () => getBoardDimensions(props.scale),
    [props.scale]
  );

  return (
    <>
      <div
        id="board"
        style={{
          backgroundImage: `url("${lunarSurfaceBgUrl}")`,
          filter: props.filter,
        }}
      >
        <table
          style={{
            width: `${boardDims.totalWidth}px`,
            height: `${boardDims.totalHeight}px`,
          }}
        >
          <tbody>
            <tr
              id="x-axis-labels"
              style={{
                background: "white",
                fontSize: "var(--chakra-fontSizes-xs)",
                height: `${AXIS_HEIGHT}px`,
                color: "black",
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
                    color: "black",
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

      {props.showInitialState &&
        (props.asteroidWarnings as RAsteroidWarning[]).map(
          (asteroidWarning, i) => (
            <AsteroidWarning
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              offset={posToOffset(props.scale, asteroidWarning.pos)}
              enableHoverInfo={props.enableHoverInfo}
              scale={props.scale}
              filter={props.filter}
            />
          )
        )}

      <Player
        offset={posToOffset(props.scale, props.gameState.player.pos)}
        energy={props.gameState.player.energy}
        message={props.gameState.player.message}
        errMessage={props.gameState.player.err_message}
        animState={props.gameState.player.anim_state}
        animData={props.gameState.player.anim_data}
        facing={props.gameState.player.facing}
        enableAnimations={props.enableAnimations}
        enableHoverInfo={props.enableHoverInfo}
        truePos={props.gameState.player.pos}
        scale={props.scale}
        filter={props.filter}
      />
      {(props.gameState.goals as RGoal[]).map((goal, i) => (
        <Goal
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(props.scale, goal.pos)}
          enableHoverInfo={props.enableHoverInfo}
          scale={props.scale}
          filter={props.filter}
        />
      ))}
      {(props.gameState.energy_cells as REnergyCell[]).map((energyCell, i) => (
        <EnergyCell
          collected={energyCell.collected}
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(props.scale, energyCell.pos)}
          enableHoverInfo={props.enableHoverInfo}
          scale={props.scale}
          filter={props.filter}
        />
      ))}
      {(props.gameState.enemies as REnemy[]).map((enemy, i) => (
        <Enemy
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(props.scale, enemy.pos)}
          facing={enemy.facing}
          enableAnimations={props.enableAnimations}
          animState={enemy.anim_state}
          animData={enemy.anim_data}
          enableHoverInfo={props.enableHoverInfo}
          scale={props.scale}
          filter={props.filter}
        />
      ))}
      {(props.gameState.obstacles as RObstacle[]).map((obstacle, i) => {
        switch (obstacle.kind) {
          case "rock":
            return (
              <Rock
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                offset={posToOffset(props.scale, obstacle.pos)}
                scale={props.scale}
                filter={props.filter}
              />
            );
          case "server":
            return (
              <Server
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                offset={posToOffset(props.scale, obstacle.pos)}
                scale={props.scale}
                filter={props.filter}
              />
            );
          case "asteroid":
            return (
              <Asteroid
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                offset={posToOffset(props.scale, obstacle.pos)}
                scale={props.scale}
                filter={props.filter}
              />
            );
          default:
            throw new Error(`Unknown obstacle kind: ${obstacle.kind}`);
        }
      })}
      {(props.gameState.buttons as RButton[]).map((button, i) => (
        <Button
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(props.scale, button.pos)}
          currentlyPressed={button.currently_pressed}
          additionalInfo={button.additional_info}
          enableAnimations={props.enableAnimations}
          enableHoverInfo={props.enableHoverInfo}
          scale={props.scale}
          filter={props.filter}
        />
      ))}
      {(props.gameState.gates as RGate[]).map((gate, i) => (
        <Gate
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(props.scale, gate.pos)}
          open={gate.open}
          additionalInfo={gate.additional_info}
          enableHoverInfo={props.enableHoverInfo}
          variant={gate.variant as "nwse" | "nesw"}
          scale={props.scale}
          filter={props.filter}
        />
      ))}
      {(props.gameState.password_gates as RPasswordGate[]).map((gate, i) => (
        <PasswordGate
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(props.scale, gate.pos)}
          open={gate.open}
          additionalInfo={gate.additional_info}
          enableHoverInfo={props.enableHoverInfo}
          variant={gate.variant as "nwse" | "nesw"}
          wrongPassword={gate.wrong_password}
          playerPos={props.gameState.player.pos}
          enableAnimations={props.enableAnimations}
          scale={props.scale}
          filter={props.filter}
        />
      ))}
      {(props.gameState.data_points as RDataPoint[]).map((dataPoint, i) => (
        <DataPoint
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(props.scale, dataPoint.pos)}
          reading={dataPoint.reading}
          additionalInfo={dataPoint.additional_info}
          enableHoverInfo={props.enableHoverInfo}
          enableSfx={props.enableAnimations}
          scale={props.scale}
          filter={props.filter}
        />
      ))}
      {(props.gameState.telepads as RTelepad[]).map((telepad, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Box key={i}>
          <Telepad
            // eslint-disable-next-line react/no-array-index-key
            key={`entrance_${i}`}
            offset={posToOffset(props.scale, telepad.start_pos)}
            kind="entrance"
            telepadIndex={i}
            enableHoverInfo={props.enableHoverInfo}
            scale={props.scale}
            filter={props.filter}
          />
          <Telepad
            // eslint-disable-next-line react/no-array-index-key
            key={`exit_${i}`}
            offset={posToOffset(props.scale, telepad.end_pos)}
            kind="exit"
            telepadIndex={i}
            enableHoverInfo={props.enableHoverInfo}
            scale={props.scale}
            filter={props.filter}
          />
        </Box>
      ))}
      {(props.gameState.big_enemies as RBigEnemy[]).map((enemy, i) => (
        <BigEnemy
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(props.scale, enemy.pos)}
          facing={enemy.facing}
          enableAnimations={props.enableAnimations}
          animState={enemy.anim_state}
          animData={enemy.anim_data}
          enableHoverInfo={props.enableHoverInfo}
          scale={props.scale}
          filter={props.filter}
        />
      ))}
      {(props.gameState.crates as RCrate[]).map((crate, i) => (
        <Crate
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          offset={posToOffset(props.scale, crate.pos)}
          color={crate.color as "red" | "blue" | "green"}
          held={crate.held}
          enableAnimations={props.enableAnimations}
          enableHoverInfo={props.enableHoverInfo}
          scale={props.scale}
          filter={props.filter}
        />
      ))}
    </>
  );
}
