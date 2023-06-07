import { Pos } from "../../elara-lib/pkg/elara_lib";
import { TILE_SIZE, AXIS_HEIGHT, AXIS_WIDTH } from "./constants";

// Returns a read-only array of the given size.
export function range(size: number): ReadonlyArray<number> {
  return [...Array(size).keys()].map((i) => i);
}

// Async function which resolves after the given number of milliseconds.
export async function sleep(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface Offset {
  pos?: Pos;
  top: string;
  left: string;
  topNum: number;
  leftNum: number;
}

export function posToOffset(pos: Pos): Offset {
  const leftNum = pos.x * (TILE_SIZE + 1) + AXIS_WIDTH + 2;
  const topNum = pos.y * (TILE_SIZE + 1) + AXIS_HEIGHT + 2;
  return {
    pos,
    left: `${leftNum}px`,
    top: `${topNum}px`,
    leftNum,
    topNum,
  };
}
