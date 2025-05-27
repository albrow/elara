import { Box } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";

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
  Asteroid as RAsteroid,
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
  enableAnimations: boolean;
  enableHoverInfo: boolean;
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

// Common pattern used by multiple board styles
const basicNoisePattern = "url(data:image/png;base64,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)";

export default function Board(props: BoardProps) {
  const boardDims = useMemo(
    () => getBoardDimensions(props.scale),
    [props.scale]
  );

  if (props.showDecoration && !props.cameraText) {
    throw new Error("cameraText is required when showDecoration is true");
  }

  const getBackgroundImage = useCallback(() => {


    switch (props.levelStyle) {
      case "glossy_tiles":
        return `${basicNoisePattern} #52525b`;
      case "gray":
        return `${basicNoisePattern} #a1a1aa`;
      case "default":
        return `url("${lunarSurfaceBgUrl}")`;
      default:
        throw new Error(`Unknown level style: ${props.levelStyle}`);
    }
  }, [props.levelStyle]);

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
            background: getBackgroundImage(),
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
        {(props.gameState.asteroid_warnings as RAsteroidWarning[]).map((asteroidWarning, i) => (
          <AsteroidWarning
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            offset={posToOffset(props.scale, asteroidWarning.pos)}
            enableHoverInfo={props.enableHoverInfo}
            scale={props.scale}
            filter={props.filter}
          />
        ))}
        {(props.gameState.asteroids as RAsteroid[]).map((asteroid) => (
          <Asteroid
            key={`asteroid_${asteroid.pos.x}_${asteroid.pos.y}`}
            offset={posToOffset(props.scale, asteroid.pos)}
            animState={asteroid.anim_state}
            scale={props.scale}
            enableAnimations={props.enableAnimations}
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
