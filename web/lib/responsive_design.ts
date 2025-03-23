// Breakpoints (in pixels).
// WARNING: If you change this, you also need to update board.css, editor.css and md_content.css.
export const BP_SM = 480;
export const BP_MD = 768;
export const BP_LG = 1112;
export const BP_XL = 1274;
export const BP_2XL = 1920;
export const BP_3XL = 2400;

// Navbar responsive definitions (used in the navbar component and other components).
export const NAVBAR_HEIGHT_BASE = 56; // In pixels
export const NAVBAR_HEIGHT_2XL = 72;
export const NAVBAR_HEIGHT_3XL = 88;
export const NAVBAR_RESPONSIVE_HEIGHT = {
  base: `${NAVBAR_HEIGHT_BASE}px`,
  // "2xl": `${NAVBAR_HEIGHT_2XL}px`,
  // "3xl": `${NAVBAR_HEIGHT_3XL}px`,
};
export const NAVBAR_DROPDOWN_ITEMS_PER_COLUMN = 12;

// Function list responsive definitions.
const FUNCTION_LIST_WIDTH_BASE = 160;
// const FUNCTION_LIST_WIDTH_XL = 200;
// const FUNCTION_LIST_WIDTH_2XL = 240;
// const FUNCTION_LIST_WIDTH_3XL = 280;
export const FUNCTION_LIST_RESPONSIVE_WIDTH = {
  base: `${FUNCTION_LIST_WIDTH_BASE}px`,
  // xl: `${FUNCTION_LIST_WIDTH_XL}px`,
  // "2xl": `${FUNCTION_LIST_WIDTH_2XL}px`,
  // "3xl": `${FUNCTION_LIST_WIDTH_3XL}px`,
};

// Function list item hover responsive definitions.
const FUNCTION_LIST_HOVER_RIGHT_OFFSET = 14;
export const FUNCTION_LIST_ITEM_HOVER_RESPONSIVE_RIGHT = {
  base: `${FUNCTION_LIST_WIDTH_BASE - FUNCTION_LIST_HOVER_RIGHT_OFFSET}px`,
  // xl: `${FUNCTION_LIST_WIDTH_XL - FUNCTION_LIST_HOVER_RIGHT_OFFSET}px`,
  // "2xl": `${FUNCTION_LIST_WIDTH_2XL - FUNCTION_LIST_HOVER_RIGHT_OFFSET}px`,
  // "3xl": `${FUNCTION_LIST_WIDTH_3XL - FUNCTION_LIST_HOVER_RIGHT_OFFSET}px`,
};
// export const FUNCTION_LIST_ITEM_HOVER_RESPONSIVE_TRANSFORM = {
//   "2xl": `scale(${BOARD_RESPONSIVE_2XL})`,
//   "3xl": `scale(${BOARD_RESPONSIVE_3XL})`,
// };

// Editor responsive definitions.
export const EDITOR_BORDER_WIDTH = 2;
export const EDITOR_SECTION_RESPONSIVE_WIDTH = {
  base: "568px",
  xl: "608px",
};

// Monitor responsive definitions.
export const MONITOR_PADDING_BASE = 10;
export const MONITOR_PADDING_2XL = 24;
export const MONITOR_BORDER_WIDTH = 1;
export const MONITOR_FRAME_RESPONSIVE_WIDTH = {
  base: "1080px",
  xl: "fit-content",
};

// Level top bar responsive definitions.
export const LEVEL_TOP_BAR_HEIGHT_BASE = 86; // In pixels
// export const LEVEL_TOP_BAR_HEIGHT_2XL = 72;
// export const LEVEL_TOP_BAR_HEIGHT_3XL = 88;
export const LEVEL_TOP_BAR_RESPONSIVE_HEIGHT = {
  base: `${LEVEL_TOP_BAR_HEIGHT_BASE}px`,
  // "2xl": `${LEVEL_TOP_BAR_HEIGHT_2XL}px`,
  // "3xl": `${LEVEL_TOP_BAR_HEIGHT_3XL}px`,
};

// Total height of the navbar and level top bar.
// This is used for spacing the level content below the navbar and level top bar.
export const LEVEL_TOTAL_TOP_HEIGHT_BASE =
  NAVBAR_HEIGHT_BASE + LEVEL_TOP_BAR_HEIGHT_BASE;
// export const LEVEL_TOTAL_TOP_HEIGHT_2XL = NAVBAR_HEIGHT_2XL + LEVEL_TOP_BAR_HEIGHT_2XL;
// export const LEVEL_TOTAL_TOP_HEIGHT_3XL = NAVBAR_HEIGHT_3XL + LEVEL_TOP_BAR_HEIGHT_3XL;
export const LEVEL_TOTAL_TOP_RESPONSIVE_HEIGHT = {
  base: `${LEVEL_TOTAL_TOP_HEIGHT_BASE}px`,
  // "2xl": `${LEVEL_TOTAL_TOP_HEIGHT_2XL}px`,
  // "3xl": `${LEVEL_TOTAL_TOP_HEIGHT_3XL}px`,
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
  // xl: TITLE_FONT_SIZE_XL,
  // "2xl": TITLE_FONT_SIZE_2XL,
  // "3xl": TITLE_FONT_SIZE_3XL,
};

// Body (e.g. text in code mirror and tooltips) font responsive definitions.
/**
 * @example fontSize={BODY_RESPONSIVE_FONT_SCALE}
 */
export const BODY_RESPONSIVE_FONT_SCALE = {
  // xl: "1em",
  // "2xl": "1.2em",
  // "3xl": "1.6em",
};

// CTA button (e.g. buttons in the editor control bar and modals) responsive definitions.
/**
 * @example size={BUTTON_RESPONSIVE_SCALE}
 */
export const BUTTON_RESPONSIVE_SCALE = {
  base: "xs",
  xl: "sm",
  // "2xl": "md",
  // "3xl": "lg",
};

/**
 * @example fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
 */
export const BUTTON_RESPONSIVE_FONT_SCALE = {
  // "3xl": "1.25rem",
};

/**
 * @example fontSize={MODAL_CLOSE_BUTTON_RESPONSIVE_FONT_SCALE}
 */
export const TOOLTIP_RESPONSIVE_MAX_WIDTH = {
  base: "300px",
  // "3xl": "400px",
};
