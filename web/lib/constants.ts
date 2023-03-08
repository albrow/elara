// Shared constants go here. Other constants should be
// defined in their respective components.

export const NAVBAR_HEIGHT = 56; // In pixels
export const CODE_AUTOSAVE_INTERVAL = 2500; // In milliseconds

// Constants related to the game board and game logic.
export const WIDTH = 12;
export const HEIGHT = 8;
export const TILE_SIZE = 50;
export const CANVAS_WIDTH = (TILE_SIZE + 1) * WIDTH + 1;
export const CANVAS_HEIGHT = (TILE_SIZE + 1) * HEIGHT + 1;
export const DEFAULT_FUEL_GAIN = 10;

// Game speed and animations.
export const DEFAULT_GAME_SPEED = 1; // steps per second
export const CSS_ANIM_DURATION = (1 / DEFAULT_GAME_SPEED) * 0.75; // seconds

// Z-indexes are all defined here so we can make sure
// elements are in the correct order.
export const LEVEL_END_MODAL_Z_INDEX = 1200;
export const JOURNAL_MODAL_Z_INDEX = 1200;
export const TUTORIAL_MODAL_Z_INDEX = 1200;
export const DIALOG_MODAL_Z_INDEX = 1150;
export const HOVER_DOC_Z_INDEX = 900;
export const TOOL_TIP_Z_INDEX = 800;
export const AXIS_LABEL_Z_INDEX = 700;
export const PLAYER_MESSAGE_Z_INDEX = 400;
export const BUG_Z_INDEX = 300;
export const PLAYER_Z_INDEX = 200;
export const FUEL_Z_INDEX = 100;
export const GOAL_Z_INDEX = 100;
export const WALL_Z_INDEX = 100;
export const GATE_Z_INDEX = 100;
export const TERMINAL_Z_INDEX = 100;

// Width and hight of the axis labels at the top and left of the
// game board.
export const AXIS_HEIGHT = 18;
export const AXIS_WIDTH = 18;
