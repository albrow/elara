import { useContext } from "react";

import { HintsModalContext } from "../contexts/hints_modal";

// A custom hook for showing and hiding the error modal.
export const useHintsModal = () => useContext(HintsModalContext);
