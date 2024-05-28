import { Pos } from "../../elara-lib/pkg/elara_lib";

// Constants related to the game board and game logic.
export const WIDTH = 12; // in tiles
export const HEIGHT = 8; // in tiles
export const DEFAULT_TILE_SIZE = 50;
export const AXIS_HEIGHT = 18; // Width of the axis labels at left of the game board (in pixels).
export const AXIS_WIDTH = 18; // Width of the axis labels at top of the game board (in pixels).

export interface Offset {
  pos?: Pos;
  top: string;
  left: string;
  topNum: number;
  leftNum: number;
}

export function posToOffset(scale: number, pos: Pos): Offset {
  const leftNum = pos.x * DEFAULT_TILE_SIZE * scale + AXIS_WIDTH + 1;
  const topNum = pos.y * DEFAULT_TILE_SIZE + scale + AXIS_HEIGHT + 1;
  return {
    pos,
    left: `${leftNum}px`,
    top: `${topNum}px`,
    leftNum,
    topNum,
  };
}

export function getTileSize(scale: number): number {
  return DEFAULT_TILE_SIZE * scale;
}

export interface SpriteDimensions {
  width: number;
  height: number;
  marginLeft: number;
  marginTop: number;
}

/**
 *
 * @returns the dimensions for a 1 tile x 1 tile sprite based on the given scale.
 */
export function getDefaultSpriteDims(scale: number): SpriteDimensions {
  return {
    width: (DEFAULT_TILE_SIZE - 2) * scale,
    height: (DEFAULT_TILE_SIZE - 2) * scale,
    marginLeft: 1 * scale,
    marginTop: 1 * scale,
  };
}

export interface BoardDimensions {
  innerWidth: number;
  innerHeight: number;
  totalWidth: number;
  totalHeight: number;
}

export function getBoardDimensions(scale: number): BoardDimensions {
  return {
    innerWidth: WIDTH * DEFAULT_TILE_SIZE * scale,
    innerHeight: HEIGHT * DEFAULT_TILE_SIZE * scale,
    totalWidth: WIDTH * DEFAULT_TILE_SIZE * scale + AXIS_WIDTH,
    totalHeight: HEIGHT * DEFAULT_TILE_SIZE * scale + AXIS_HEIGHT,
  };
}
