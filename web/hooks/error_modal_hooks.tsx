import { useContext } from "react";

import { ErrorModalContext } from "../contexts/error_modal";

// A custom hook for showing and hiding the error modal.
export const useErrorModal = () => useContext(ErrorModalContext);
