import { useContext } from "react";
import { ShortsModalContext } from "../contexts/shorts_modal";

// A custom hook for showing and hiding the tutorial shorts modal.
export const useShortsModal = () => useContext(ShortsModalContext);
