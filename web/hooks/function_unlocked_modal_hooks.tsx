import { useContext } from "react";
import { FunctionUnlockedModalContext } from "../contexts/function_unlocked_modal";

// A custom hook for showing and hiding the function unlocked modal.
export const useFunctionUnlockedModal = () =>
  useContext(FunctionUnlockedModalContext);
