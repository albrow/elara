import { Pos } from "../../elara-lib/pkg/elara_lib";
import { TILE_SIZE } from "./constants";

// Returns a read-only array of the given size.
export function range(size: number): ReadonlyArray<number> {
  return [...Array(size).keys()].map((i) => i);
}

export interface Offset {
  top: string;
  left: string;
}

export function posToOffset(pos: Pos): Offset {
  return {
    left: `${pos.x * (TILE_SIZE + 1) + 1}px`,
    top: `${pos.y * (TILE_SIZE + 1) + 1}px`,
  };
}
