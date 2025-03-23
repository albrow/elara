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
import BoardDecoration from "./board_decoration";

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
  // Whether or not to show the decoration at the top of the board
  // that makes it look like a video feed.
  showDecoration?: boolean;
  // The text to display in the decoration at the top of the board.
  cameraText?: string;
  // The style of the corresponding level (affects background image and other
  // visual elements).
  levelStyle: string;
}

export default function Board(props: BoardProps) {
  const boardDims = useMemo(
    () => getBoardDimensions(props.scale),
    [props.scale]
  );

  if (props.showDecoration && !props.cameraText) {
    throw new Error("cameraText is required when showDecoration is true");
  }

  return (
    <>
      {props.showDecoration && <BoardDecoration text={props.cameraText!} />}
      <Box
        position="relative"
        id="board-inner-wrapper"
        overflow="hidden"
        w="100%"
        h="100%"
      >
        <div
          id="board"
          style={{
            background: props.levelStyle === "glossy_tiles"
              ? "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVBzuIOGSoThZERRy1CkWoEGqFVh1MLv2CJg1Jiouj4Fpw8GOx6uDirKuDqyAIfoA4OTopukiJ/0sKLWI8OO7Hu3uPu3eAUC8zzeoYBzTdNlOJuJjJroqhVwQRQgCDGJKZZcxJUhK+4+seAb7exXiW/7k/R4+asxgQEIlnmWHaxBvE05u2wXmfOMKKskp8Tjxm0gWJH7muePzGueCywDMjZjo1TxwhFgttrLQxK5oa8RRxVNV0yhcyHquctzhr5Spr3pO/MJzTV5a5TnMICSxiCRJEKKiihDJsxGjVSbGQov24j3/Q9UvkUshVAiPHAirQILt+8D/43a2Vn5zwksJxoPPFcT5GgNAu0Kg5zvex4zROgOAzcKW3/JU6MPNJeq2lRY+Avm3g4rqlKXvA5Q4w8GTIpuxKQZpCPg+8n9E3ZYH+W6B7ze2tuY/TByBDXaVugINDYKRA2ese7+7u7O3fM63+fgDFjHLHQhL4PQAAAAZYSGVUAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAFpJREFUeJztwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4GtmvAABQNi1YAAAAABJRU5ErkJggg==') center/100px 100px, linear-gradient(45deg, #606060, #6a6a6a)"
              : `url("${lunarSurfaceBgUrl}")`,
            filter: props.filter,
          }}
        >
          <table
            style={{
              width: `${boardDims.innerWidth}px`,
              height: `${boardDims.innerHeight}px`,
            }}
          >
            <tbody>
              {range(HEIGHT).map((y) => (
                <tr key={y} className="row">
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
          showReflection={props.levelStyle === "glossy_tiles"}
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
        {(props.gameState.energy_cells as REnergyCell[]).map(
          (energyCell, i) => (
            <EnergyCell
              collected={energyCell.collected}
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              offset={posToOffset(props.scale, energyCell.pos)}
              enableHoverInfo={props.enableHoverInfo}
              scale={props.scale}
              filter={props.filter}
              showReflection={props.levelStyle === "glossy_tiles"}
            />
          )
        )}
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
                  showReflection={props.levelStyle === "glossy_tiles"}
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
            showReflection={props.levelStyle === "glossy_tiles"}
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
            showReflection={props.levelStyle === "glossy_tiles"}
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
      </Box >
    </>
  );
}

// set default props
Board.defaultProps = {
  showDecoration: true,
};
