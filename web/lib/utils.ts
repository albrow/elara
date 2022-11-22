import { Pos } from "../../elara-lib/pkg/elara_lib";
import { TILE_SIZE, AXIS_HEIGHT, AXIS_WIDTH } from "./constants";

// Returns a read-only array of the given size.
export function range(size: number): ReadonlyArray<number> {
  return [...Array(size).keys()].map((i) => i);
}

export interface Offset {
  pos: Pos;
  top: string;
  left: string;
}

export function posToOffset(pos: Pos): Offset {
  return {
    pos,
    left: `${pos.x * (TILE_SIZE + 1) + AXIS_WIDTH + 2}px`,
    top: `${pos.y * (TILE_SIZE + 1) + AXIS_HEIGHT + 2}px`,
  };
}
