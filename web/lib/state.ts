import {
  State as RustState,
  StateWithPos as RustStateWithPos,
  Fuel as RustFuel,
} from "../../battle-game-lib/pkg";

export interface StateWithLine {
  state: State;
  linePos?: LinePos;
}

export interface LinePos {
  line: number;
  col: number;
}

export interface State {
  player: Player;
  fuel: Fuel[];
}

export interface Pos {
  x: number;
  y: number;
}

export interface Player {
  pos: Pos;
}

export interface Fuel {
  pos: Pos;
}

export function emptyLineState(state: State): StateWithLine {
  return {
    state,
  };
}

export function rustToJsState(rustState: RustState): State {
  return {
    player: {
      pos: {
        x: rustState.player.pos.x,
        y: rustState.player.pos.y,
      },
    },
    fuel: rustState.fuel.map((fuel: RustFuel) => ({
      pos: {
        x: fuel.pos.x,
        y: fuel.pos.y,
      },
    })),
  };
}

export function rustToJsStateWithLine(
  rustStateWithPos: RustStateWithPos
): StateWithLine {
  return {
    state: rustToJsState(rustStateWithPos.state),
    linePos: {
      line: rustStateWithPos.line,
      col: rustStateWithPos.col,
    },
  };
}
