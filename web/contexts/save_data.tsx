import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const VERSION = 2;
const LOCAL_STORAGE_KEY = "elara.save";

export interface LevelState {
  // Has the objective of the level been completed?
  completed: boolean;
  // The latest user code.
  code: string;
}

// The macro state of the game, including which levels have been
// completed, user settings, dialog options, etc.
export interface SaveData {
  // The version of the save data.
  version: number;
  // A mapping of scene names to their corresponding state.
  levelStates: Record<string, LevelState>;
  // Tracks which dialog trees the user has already seen.
  seenDialogTrees: string[];
}

function deepCopy(saveData: SaveData): SaveData {
  return {
    version: saveData.version,
    levelStates: { ...saveData.levelStates },
    seenDialogTrees: [...saveData.seenDialogTrees],
  };
}

export function save(saveData: SaveData): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
}

export function load(): SaveData {
  const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (rawData) {
    const saveData = JSON.parse(rawData);
    if (saveData.version === VERSION) {
      return saveData;
    }
    // TODO(albrow): SaveData migrations. I.e., if the version of saveData
    // is older than the current version, we should "migrate" it to match
    // the structure of the current version if possible.
    //
    // For now, just log a warning and return the default save data.
    console.warn("Save data version mismatch");
  }
  return {
    version: VERSION,
    levelStates: {},
    seenDialogTrees: [],
  };
}

// Returns a copy of the save data with the level state updated to complete.
export function markLevelCompleted(
  saveData: SaveData,
  levelName: string
): SaveData {
  const newSaveData = deepCopy(saveData);
  newSaveData.levelStates[levelName] = {
    completed: true,
    code: saveData.levelStates[levelName]?.code || "",
  };
  return newSaveData;
}

export function updateLevelCode(
  saveData: SaveData,
  levelName: string,
  code: string
): SaveData {
  const newSaveData = deepCopy(saveData);
  newSaveData.levelStates[levelName] = {
    completed: saveData.levelStates[levelName]?.completed || false,
    code,
  };
  return newSaveData;
}

export function markDialogSeen(saveData: SaveData, treeName: string): SaveData {
  const newSaveData = deepCopy(saveData);
  if (!newSaveData.seenDialogTrees.includes(treeName)) {
    newSaveData.seenDialogTrees.push(treeName);
  }
  return newSaveData;
}

export const SaveDataContext = createContext<
  readonly [SaveData, Dispatch<SetStateAction<SaveData>>]
>([
  load(),
  () => {
    throw new Error("useSaveData must be used within a SaveDataContext");
  },
] as const);

// A custom hook for loading and saving save data from localStorage.
// Can be used in any component where the save data needs to be referenced
// or updated. Under the hood, this uses a context so that updates to the
// save data will trigger a re-render of all components that use this hook.
export const useSaveData = () => useContext(SaveDataContext);

export function SaveDataProvider(props: PropsWithChildren<{}>) {
  const [saveData, setSaveData] = useState<SaveData>(load());
  useEffect(() => {
    // Use setTimeout to write to local storage asynchronously.
    // This way we don't block the main thread.
    setTimeout(() => save(saveData), 0);
  }, [saveData]);
  const providerValue = useMemo(
    () => [saveData, setSaveData] as const,
    [saveData, setSaveData]
  );

  return (
    <SaveDataContext.Provider value={providerValue}>
      {props.children}
    </SaveDataContext.Provider>
  );
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest;

  describe("save_data", () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    describe("markLevelCompleted", () => {
      it("marks only the given level as completed", () => {
        const saveData = {
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: false,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
        };
        const newSaveData = markLevelCompleted(saveData, "First Steps");
        expect(newSaveData).toStrictEqual({
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: true,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
        });
      });
    });

    describe("updateLevelCode", () => {
      it("updates the code for the given level", () => {
        const saveData = {
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: false,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
        };
        const newSaveData = updateLevelCode(
          saveData,
          "Fuel Up",
          `say("updated");`
        );
        expect(newSaveData).toStrictEqual({
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: false,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              code: `say("updated");`,
            },
          },
          seenDialogTrees: ["movement"],
        });
      });
    });

    describe("markDialogSeen", () => {
      it("adds the given dialog tree to the list of seen trees", () => {
        const saveData = {
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: false,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: true,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
        };
        const newSaveData = markDialogSeen(saveData, "fuel_part_one");
        expect(newSaveData).toStrictEqual({
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: false,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: true,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement", "fuel_part_one"],
        });
      });
    });

    describe("save", () => {
      it("saves the given save data to localStorage", () => {
        const saveData = {
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: false,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
        };
        save(saveData);
        expect(
          JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)!)
        ).toStrictEqual(saveData);
      });
    });

    describe("load", () => {
      it("returns the default save data if there is no save data in localStorage", () => {
        expect(load()).toStrictEqual({
          version: VERSION,
          levelStates: {},
          seenDialogTrees: [],
        });
      });

      it("loads the save data from localStorage", () => {
        const saveData = {
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: false,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
        };
        window.localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(saveData)
        );
        expect(load()).toStrictEqual(saveData);
      });
    });
  });
}
