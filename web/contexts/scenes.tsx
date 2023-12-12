import { PropsWithChildren, createContext, useMemo } from "react";

import { useSaveData } from "../hooks/save_data_hooks";
import { Scene, getProcessedScenes } from "../lib/scenes";

export const ScenesContext = createContext<Scene[]>([]);

export function ScenesProvider(props: PropsWithChildren<{}>) {
  const [{ levelStates, seenJournalPages, seenDialogTrees, seenCutscenes }, _] =
    useSaveData();
  const providerValue = useMemo(
    () =>
      getProcessedScenes(
        levelStates,
        seenJournalPages,
        seenDialogTrees,
        seenCutscenes
      ),
    [levelStates, seenCutscenes, seenDialogTrees, seenJournalPages]
  );

  return (
    <ScenesContext.Provider value={providerValue}>
      {props.children}
    </ScenesContext.Provider>
  );
}
