// Shared constants go here. Other constants should be
// defined in their respective components.

// Minimum bg size / whole screen size.
// export const MIN_BG_WIDTH = "980px";

// Music and sfx
// How long to wait when navigating to a new scene before playing the sound.
export const SOUND_DELAY_TIME_MS = 100;
// How long it takes to fade out one song before playing the next.
export const MUSIC_FADE_OUT_TIME_MS = 1000;

// Game speed and animations.
export const DEFAULT_GAME_SPEED = 1; // steps per second
export const DEFAULT_STEP_TIME = 1000 / DEFAULT_GAME_SPEED; // milliseconds
export const CSS_ANIM_DURATION = (1 / DEFAULT_GAME_SPEED) * 0.75; // seconds
export const PLAYER_DEFAULT_CSS_ANIM_DELAY = 0.1; // seconds

// Common CSS properties used across different components.
export const SPRITE_DROP_SHADOW = "drop-shadow(0px 3px 1px rgba(0, 0, 0, 0.3))";

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
export const REFLECTION_Z_INDEX = 5;
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
export const CHALLENGE_TOOL_TIP_Z_INDEX = 3000; // Used for challenge tooltips. (We want this to be above the level select modal.)
export const LEVEL_SELECT_OVERLAY_Z_INDEX = 4000; // Used for the overlay over the level preview in the level select modal. We want this to be higher than anything else on the board.

// Various messages that are displayed to the user.
export const CODE_LEN_EXPLANATION =
  "The number of characters in your code not including things like comments, newlines, or tabs.";
