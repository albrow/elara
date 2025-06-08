import { Pos } from "../../elara-lib/pkg/elara_lib";

// Constants related to the game board and game logic.
export const WIDTH = 12; // in tiles
export const HEIGHT = 8; // in tiles
export const DEFAULT_TILE_SIZE = 50;

export interface Offset {
  pos?: Pos;
  top: string;
  left: string;
  topNum: number;
  leftNum: number;
}

export function posToOffset(scale: number, pos: Pos): Offset {
  const leftNum = (pos.x * (DEFAULT_TILE_SIZE + 1) + 1) * scale;
  const topNum = (pos.y * (DEFAULT_TILE_SIZE + 1) + 1) * scale;
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
}

export function getBoardDimensions(scale: number): BoardDimensions {
  const innerWidth = WIDTH * (DEFAULT_TILE_SIZE + 1) * scale + 1;
  const innerHeight = HEIGHT * (DEFAULT_TILE_SIZE + 1) * scale + 1;
  return {
    innerWidth,
    innerHeight,
  };
}
