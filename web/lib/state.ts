import {
  State as RustState,
  StateWithPos as RustStateWithPos,
  Fuel as RustFuel,
} from "../../battle-game-lib/pkg";

export interface StateWithPos {
  state: State;
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

export function rustToJsStateWithPos(
  rustStateWithPos: RustStateWithPos
): StateWithPos {
  return {
    state: rustToJsState(rustStateWithPos.state),
    line: rustStateWithPos.line,
    col: rustStateWithPos.col,
  };
}
