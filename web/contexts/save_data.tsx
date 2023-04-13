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
import clone from "clone";

import { ShortId } from "../lib/tutorial_shorts";
import { LevelData } from "../../elara-lib/pkg/elara_lib";

export const VERSION = 7;
const LOCAL_STORAGE_KEY = "elara.save";

export interface LevelState {
  // Has the objective of the level been completed?
  completed: boolean;
  // The latest user code.
  code: string;
  // Whether or not the challenge was completed.
  challengeCompleted?: boolean;
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
  // Tracks which tutorial shorts have been seen.
  seenTutorialShorts: ShortId[];
}

export function save(saveData: SaveData): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
}

function migrateSaveData(saveData: SaveData): SaveData {
  const newData = clone(saveData);

  if (saveData.version < 5) {
    // For older versions, just log a warning and return the default save data.
    console.warn("Save data too old to migrate. Falling back to default.");
    return {
      version: VERSION,
      levelStates: {},
      seenDialogTrees: [],
      seenTutorialShorts: [],
    };
  }

  // Migrate from version 5 to 6.
  if (newData.version === 5) {
    newData.version = 6;
    // The structure of the level changed from version 5 to 6, so the
    // old code won't work anymore.
    delete newData.levelStates.gate_and_terminal;
  }

  // Migrate from version 6 to 7.
  if (newData.version === 6) {
    newData.version = 7;
    // gate_and_terminal_part_two was renamed to gate_and_terminal_part_three
    // and a new level was added in its place.
    if (newData.levelStates.gate_and_terminal_part_two) {
      newData.levelStates.gate_and_terminal_part_three =
        newData.levelStates.gate_and_terminal_part_two;
      delete newData.levelStates.gate_and_terminal_part_two;
    }
  }

  return newData;
}

export function load(): SaveData {
  const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (rawData) {
    const saveData = JSON.parse(rawData);
    if (saveData.version === VERSION) {
      return saveData;
    }
    return migrateSaveData(saveData);
  }
  return {
    version: VERSION,
    levelStates: {},
    seenDialogTrees: [],
    seenTutorialShorts: [],
  };
}

// Returns a copy of the save data with the level state updated to complete.
export function markLevelCompleted(
  saveData: SaveData,
  levelName: string
): SaveData {
  const newSaveData = clone(saveData);
  newSaveData.levelStates[levelName] = {
    completed: true,
    challengeCompleted:
      saveData.levelStates[levelName]?.challengeCompleted || false,
    code: saveData.levelStates[levelName]?.code || "",
  };
  return newSaveData;
}

// Returns a copy of the save data with challengeCompleted marked as true for the
// given level.
export function markLevelChallengeCompleted(
  saveData: SaveData,
  levelName: string
): SaveData {
  const newSaveData = clone(saveData);
  newSaveData.levelStates[levelName] = {
    completed: saveData.levelStates[levelName]?.completed || false,
    challengeCompleted: true,
    code: saveData.levelStates[levelName]?.code || "",
  };
  return newSaveData;
}

export function updateLevelCode(
  saveData: SaveData,
  levelName: string,
  code: string
): SaveData {
  const newSaveData = clone(saveData);
  newSaveData.levelStates[levelName] = {
    completed: saveData.levelStates[levelName]?.completed || false,
    challengeCompleted:
      saveData.levelStates[levelName]?.challengeCompleted || false,
    code,
  };
  return newSaveData;
}

export function markDialogSeen(saveData: SaveData, treeName: string): SaveData {
  const newSaveData = clone(saveData);
  if (!newSaveData.seenDialogTrees.includes(treeName)) {
    newSaveData.seenDialogTrees.push(treeName);
  }
  return newSaveData;
}

export function markTutorialShortSeen(
  saveData: SaveData,
  shortId: ShortId
): SaveData {
  const newSaveData = clone(saveData);
  if (!newSaveData.seenTutorialShorts.includes(shortId)) {
    newSaveData.seenTutorialShorts.push(shortId);
  }
  return newSaveData;
}

export interface ChallengeProgress {
  completed: number;
  available: number;
}

export function getChallengeProgress(
  levels: Map<string, LevelData>,
  saveData: SaveData
): ChallengeProgress {
  let completed = 0;
  let available = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const [levelName, levelState] of Object.entries(saveData.levelStates)) {
    if (levels.get(levelName)?.challenge !== "") {
      available += 1;
      if (levelState.challengeCompleted) {
        completed += 1;
      }
    }
  }

  return {
    completed,
    available,
  };
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
              challengeCompleted: false,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              challengeCompleted: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
          seenTutorialShorts: ["how_to_run_code"],
        };
        const newSaveData = markLevelCompleted(saveData, "First Steps");
        expect(newSaveData).toStrictEqual({
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: true,
              challengeCompleted: false,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              challengeCompleted: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
          seenTutorialShorts: ["how_to_run_code"],
        });
      });
    });

    describe("updateLevelCode", () => {
      it("updates the code for the given level", () => {
        const saveData = {
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: true,
              challengeCompleted: true,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
          seenTutorialShorts: ["how_to_run_code"],
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
              completed: true,
              challengeCompleted: true,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: false,
              challengeCompleted: false,
              code: `say("updated");`,
            },
          },
          seenDialogTrees: ["movement"],
          seenTutorialShorts: ["how_to_run_code"],
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
          seenTutorialShorts: ["how_to_run_code"],
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
          seenTutorialShorts: ["how_to_run_code"],
        });
      });
    });

    describe("markTutorialShortSeen", () => {
      it("adds the given short to the list of seen shorts", () => {
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
          seenTutorialShorts: ["how_to_run_code"],
        };
        const newSaveData = markTutorialShortSeen(
          saveData,
          "how_to_see_errors"
        );
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
          seenDialogTrees: ["movement"],
          seenTutorialShorts: ["how_to_run_code", "how_to_see_errors"],
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
          seenTutorialShorts: ["how_to_run_code"],
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
          seenTutorialShorts: [],
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
          seenTutorialShorts: ["how_to_run_code"],
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
