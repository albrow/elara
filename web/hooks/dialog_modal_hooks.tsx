import { useContext } from "react";

import { DialogModalContext } from "../contexts/dialog_modal";

/**
 * A hook that returns the functions for showing/hiding the dialog modal.
 *
 * @returns [showDialogModal: (dialogTreeName: string) => void, hideDialogModal: () => void]
 */
export const useDialogModal = () => useContext(DialogModalContext);
