// Shared constants go here. Other constants should be
// defined in their respective components.
export const PROD_HOSTNAME = "play.elaragame.com";

// Screen size.
export const MIN_BG_WIDTH = "980px";

// How long to wait when navigating to a new scene before playing the sound.
export const SOUND_DELAY_TIME_MS = 100;
// How long it takes to fade out one song before playing the next.
export const MUSIC_FADE_OUT_TIME_MS = 1000;

// Constants related to the game board and game logic.
export const WIDTH = 12;
export const HEIGHT = 8;
export const TILE_SIZE = 50;
export const AXIS_HEIGHT = 18; // Width of the axis labels at left of the game board.
export const AXIS_WIDTH = 18; // Width of the axis labels at top of the game board.
export const BOARD_INNER_WIDTH = TILE_SIZE * WIDTH;
export const BOARD_INNER_HEIGHT = TILE_SIZE * HEIGHT;
export const BOARD_TOTAL_WIDTH = BOARD_INNER_WIDTH + AXIS_WIDTH + 2;
export const BOARD_TOTAL_HEIGHT = BOARD_INNER_HEIGHT + AXIS_HEIGHT + 2;

export const DEFAULT_ENERGY_CELL_GAIN = 10;
export const SPRITE_DROP_SHADOW = "drop-shadow(0px 3px 1px rgba(0, 0, 0, 0.3))";
export const WIRE_DROP_SHADOW = "drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.3))";

// Game speed and animations.
export const DEFAULT_GAME_SPEED = 1; // steps per second
export const DEFAULT_STEP_TIME = 1000 / DEFAULT_GAME_SPEED; // milliseconds
export const CSS_ANIM_DURATION = (1 / DEFAULT_GAME_SPEED) * 0.75; // seconds
export const PLAYER_DEFAULT_CSS_ANIM_DELAY = 0.1; // seconds

// Constants related to the game's UI.
export const NAVBAR_HEIGHT_BASE = 56; // In pixels
export const NAVBAR_HEIGHT_2XL = 72;
export const NAVBAR_HEIGHT_3XL = 88;
export const NAVBAR_RESPONSIVE_HEIGHT = {
  base: `${NAVBAR_HEIGHT_BASE}px`,
  "2xl": `${NAVBAR_HEIGHT_2XL}px`,
  "3xl": `${NAVBAR_HEIGHT_3XL}px`,
};
export const NAVBAR_DROPDOWN_ITEMS_PER_COLUMN = 12;
export const HOVER_DOC_BOX_SHADOW = "2px 2px 10px";

// The following constants are used to scale the board for responsive design.
// WARNING: If you change these, remember to also update md_content.css.
const BOARD_RESPONSIVE_BASE = 0.77;
const BOARD_RESPONSIVE_2XL = 1.2;
const BOARD_RESPONSIVE_3XL = 1.5;
export const BOARD_WRAPPER_RESPONSIVE_TRANSFORM = {
  base: `scale(${BOARD_RESPONSIVE_BASE})`, // 477.4px
  xl: "none", // 620px
  "2xl": `scale(${BOARD_RESPONSIVE_2XL})`, // 744px
  "3xl": `scale(${BOARD_RESPONSIVE_3XL})`, // 930px
};

// Function list responsive definitions.
const FUNCTION_LIST_WIDTH_BASE = 160;
const FUNCTION_LIST_WIDTH_XL = 200;
const FUNCTION_LIST_WIDTH_2XL = 240;
const FUNCTION_LIST_WIDTH_3XL = 280;
export const FUNCTION_LIST_RESPONSIVE_WIDTH = {
  base: `${FUNCTION_LIST_WIDTH_BASE}px`,
  xl: `${FUNCTION_LIST_WIDTH_XL}px`,
  "2xl": `${FUNCTION_LIST_WIDTH_2XL}px`,
  "3xl": `${FUNCTION_LIST_WIDTH_3XL}px`,
};

// Function list item hover responsive definitions.
const FUNCTION_LIST_HOVER_RIGHT_OFFSET = 14;
export const FUNCTION_LIST_ITEM_HOVER_RESPONSIVE_RIGHT = {
  base: `${FUNCTION_LIST_WIDTH_BASE - FUNCTION_LIST_HOVER_RIGHT_OFFSET}px`,
  xl: `${FUNCTION_LIST_WIDTH_XL - FUNCTION_LIST_HOVER_RIGHT_OFFSET}px`,
  "2xl": `${FUNCTION_LIST_WIDTH_2XL - FUNCTION_LIST_HOVER_RIGHT_OFFSET}px`,
  "3xl": `${FUNCTION_LIST_WIDTH_3XL - FUNCTION_LIST_HOVER_RIGHT_OFFSET}px`,
};
export const FUNCTION_LIST_ITEM_HOVER_RESPONSIVE_TRANSFORM = {
  "2xl": `scale(${BOARD_RESPONSIVE_2XL})`,
  "3xl": `scale(${BOARD_RESPONSIVE_3XL})`,
};

// Editor responsive definitions.
export const EDITOR_BORDER_WIDTH = 2;
export const EDITOR_SECTION_RESPONSIVE_WIDTH = {
  base: `${BOARD_TOTAL_WIDTH * BOARD_RESPONSIVE_BASE}px`,
  xl: `${BOARD_TOTAL_WIDTH}px`,
  "2xl": `${BOARD_TOTAL_WIDTH * BOARD_RESPONSIVE_2XL}px`,
  "3xl": `${BOARD_TOTAL_WIDTH * BOARD_RESPONSIVE_3XL}px`,
};

// Monitor responsive definitions.
export const MONTIOR_PADDING_BASE = 10;
export const MONITOR_PADDING_2XL = 24;
export const MONITOR_BORDER_WIDTH = 3;
export const MONITOR_FRAME_RESPONSIVE_WIDTH = {
  base: `calc(${
    BOARD_TOTAL_WIDTH * BOARD_RESPONSIVE_BASE * 2 +
    MONTIOR_PADDING_BASE * 2 +
    MONITOR_BORDER_WIDTH * 2
  }px + 0.5rem)`,
  xl: "fit-content",
  "2xl": `calc(${
    BOARD_TOTAL_WIDTH * BOARD_RESPONSIVE_2XL * 2 +
    MONITOR_PADDING_2XL * 2 +
    MONITOR_BORDER_WIDTH * 2
  }px + 0.5rem)`,
  "3xl": `calc(${
    BOARD_TOTAL_WIDTH * BOARD_RESPONSIVE_3XL * 2 +
    MONITOR_PADDING_2XL * 2 +
    MONITOR_BORDER_WIDTH * 2
  }px + 0.5rem)`,
};

// Title font responsive definitions.
export const LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_BASE = 16;
export const LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_XL = 18;
export const LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_2XL = 20;
export const LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_3XL = 22;
export const TITLE_FONT_SIZE_BASE = "1.4em";
export const TITLE_FONT_SIZE_XL = "1.8em";
export const TITLE_FONT_SIZE_2XL = "2.2em";
export const TITLE_FONT_SIZE_3XL = "2.6em";
/**
 * @example fontSize={TITLE_RESPONSIVE_FONT_SCALE}
 */
export const TITLE_RESPONSIVE_FONT_SCALE = {
  base: TITLE_FONT_SIZE_BASE,
  xl: TITLE_FONT_SIZE_XL,
  "2xl": TITLE_FONT_SIZE_2XL,
  "3xl": TITLE_FONT_SIZE_3XL,
};

// Body (e.g. text in code mirror and tooltips) font responsive definitions.
/**
 * @example fontSize={BODY_RESPONSIVE_FONT_SCALE}
 */
export const BODY_RESPONSIVE_FONT_SCALE = {
  xl: "1em",
  "2xl": "1.2em",
  "3xl": "1.6em",
};

// CTA button (e.g. buttons in the editor control bar and modals) responsive definitions.
/**
 * @example size={BUTTON_RESPONSIVE_SCALE}
 */
export const BUTTON_RESPONSIVE_SCALE = {
  base: "xs",
  xl: "sm",
  "2xl": "md",
  "3xl": "lg",
};

/**
 * @example fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
 */
export const BUTTON_RESPONSIVE_FONT_SCALE = {
  "3xl": "1.25rem",
};

/**
 * @example fontSize={MODAL_CLOSE_BUTTON_RESPONSIVE_FONT_SCALE}
 */
export const TOOLTIP_RESPONSIVE_MAX_WIDTH = {
  base: "300px",
  "3xl": "400px",
};

// Breakpoints for responsive design. In pixels.
// WARNING: If you change this, you also need to update board.css, editor.css and md_content.css.
export const BP_SM = 480;
export const BP_MD = 768;
export const BP_LG = 992;
export const BP_XL = 1268;
export const BP_2XL = 1920;
export const BP_3XL = 2400;

// Z-indexes are all defined here so we can make sure
// elements are in the correct order.
//
// **IMPORTANT**: If you change these, search for related CSS properties.
// Some CSS properties need to be manually kept in sync with these values.
// In such a case, there should be a comment above the CSS property explaining it.

// Start with background images and frames.
export const BG_Z_INDEX = -1000;
export const MONITOR_STAND_Z_INDEX = -950;
export const MONITOR_FRAME_Z_INDEX = -900;
export const JOURNAL_HANDLES_Z_INDEX = -800;

// Next section is for the board/map and the elements that appear on top of it.
export const BOARD_BG_Z_INDEX = -100;
export const BUTTON_WIRE_Z_INDEX = 10;
export const ASTEROID_WARNING_Z_INDEX = 20;
export const ROCK_Z_INDEX = 20;

export const DATA_POINT_Z_INDEX = 30;
export const UNLOCKED_GATE_Z_INDEX = 40;
export const BUTTON_Z_INDEX = 50;
export const TELEPAD_Z_INDEX = 60;
export const GOAL_Z_INDEX = 70;
export const ENERGY_CELL_Z_INDEX = 80;
export const PLAYER_Z_INDEX = 110;
export const ENEMY_Z_INDEX = 120;
export const LOCKED_GATE_Z_INDEX = 130;
export const SERVER_Z_INDEX = 140;
export const ASTEROID_Z_INDEX = 150;
export const CRATE_Z_INDEX = 160;

export const ROVER_MESSAGE_Z_INDEX = 1010; // Special tooltip variant used only for rover messages.
export const BOARD_HOVER_INFO_Z_INDEX = 1020;
export const AXIS_LABEL_Z_INDEX = 1030;
export const SCROLL_INDICATOR_Z_INDEX = 1035; // Used for the "scroll for more" indicator.
export const CM_TOOL_TIP_Z_INDEX = 1040; // Used for Codemirror tooltips (e.g. hover docs).
export const CHAKRA_TOOL_TIP_Z_INDEX = 1060; // Used for Chakra tooltips (not including rover messages).
export const FULLSCREEN_VIDEO_Z_INDEX = 1065; // Used for cutscenes.
export const VIDEO_SKIP_BUTTON_Z_INDEX = FULLSCREEN_VIDEO_Z_INDEX + 1;
export const VIDEO_END_SCREEN_Z_INDEX = VIDEO_SKIP_BUTTON_Z_INDEX + 1; // Shown when fullscreen videos end. Should cover the video.
export const NAVBAR_Z_INDEX = 2000;
export const CHAKRA_MODAL_Z_INDEX = 2050; // Used for Chakra modals.

// Various messages that are displayed to the user.
export const CODE_LEN_EXPLANATION =
  "The number of characters in your code not including comments, spaces, newlines, or tabs.";
