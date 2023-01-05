import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";

export const VERSION = 1;
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
}

function deepCopy(saveData: SaveData): SaveData {
  return {
    version: saveData.version,
    levelStates: { ...saveData.levelStates },
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
    version: 1,
    levelStates: {},
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

// A custom hook for loading and saving save data from localStorage.
// Can be used in any component where the save data needs to be referenced
// or updated.
export function useSaveData(): readonly [
  SaveData,
  Dispatch<SetStateAction<SaveData>>
] {
  const [saveData, setSaveData] = useState<SaveData>(load());
  useEffect(() => {
    // Use setTimeout to write to local storage asynchronously.
    // This way we don't block the main thread.
    setTimeout(() => save(saveData), 0);
  }, [saveData]);
  return [saveData, setSaveData] as const;
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
        });
      });
    });

    describe("useSaveData", () => {
      // Note(albrow): We use renderHook from @testing-library/react to test
      // custom hooks. Hooks look like plain functions but cannot be tested directly
      // See https://kentcdodds.com/blog/how-to-test-custom-react-hooks for more
      // information.
      it("returns the default data if no data is saved", () => {
        // "result" is a reference that represents the current state of
        // the hook. It has the following properties:
        //
        //   - result.current[0] = saveData
        //   - result.current[1] = setSaveData
        //
        const { result } = renderHook(() => useSaveData());

        expect(result.current[0]).toStrictEqual({
          version: VERSION,
          levelStates: {},
        });
      });

      it("loads data from localStorage if it exists", () => {
        window.localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            version: VERSION,
            levelStates: {
              "First Steps": {
                completed: true,
                code: `say("hello");`,
              },
            },
          })
        );

        const { result } = renderHook(() => useSaveData());

        expect(result.current[0]).toStrictEqual({
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: true,
              code: `say("hello");`,
            },
          },
        });
      });

      it("ignores data with a different version", () => {
        window.localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            version: VERSION + 1,
            levelStates: {
              "First Steps": {
                completed: true,
                code: `say("hello");`,
              },
            },
          })
        );

        const { result } = renderHook(() => useSaveData());

        expect(result.current[0]).toStrictEqual({
          version: VERSION,
          levelStates: {},
        });
      });

      it("saves and loads data correctly", () => {
        const { result } = renderHook(() => useSaveData());

        const newSaveData = {
          version: VERSION,
          levelStates: {
            "First Steps": {
              completed: true,
              code: `say("hello");`,
            },
            "Fuel Up": {
              completed: true,
              code: `move_right(5);`,
            },
          },
        };

        act(() => {
          const setSaveData = result.current[1];
          setSaveData(newSaveData);
        });

        expect(result.current[0]).toStrictEqual(newSaveData);
      });
    });
  });
}
