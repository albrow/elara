import { useContext } from "react";

import { LevelSelectModalContext } from "../contexts/level_select_modal";

/**
 *
 * @returns [showLevelSelectModal: () => void], a function that can be called to
 * show the level select modal.
 */
export const useLevelSelectModal = () => useContext(LevelSelectModalContext);
