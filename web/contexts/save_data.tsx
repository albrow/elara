import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clone from "clone";

import debounce from "lodash.debounce";
import { ShortId } from "../lib/tutorial_shorts";
import { sleep } from "../lib/utils";
import { SAVE_DATA_VERSION } from "../lib/constants";
import { SectionName } from "../components/journal/sections";

const LOCAL_STORAGE_KEY = "elara.save";

// Amount of time (in milliseconds) to wait for further updates before
// saving data to local storage. Used as a parameter for the "debounce"
// function to help prevent writing to local storage too often.
const SAVE_DEBOUNCE_INTERVAL = 100;
// Max amount of time (in milliseconds) to wait before writing to local
// storage. Used as a parameter for the "debounce" function.
const SAVE_MAX_WAIT = 1000;

export interface LevelState {
  // Has the objective of the level been completed?
  completed: boolean;
  // The latest user code.
  code: string;
  // Whether or not the challenge was completed.
  challengeCompleted?: boolean;
}

export interface Settings {
  masterVolume: number;
  musicVolume: number;
  soundEffectsVolume: number;
  dialogVolume: number;
}

const DEFUALT_SETTINGS: Settings = {
  masterVolume: 0.8,
  musicVolume: 0.8,
  soundEffectsVolume: 1,
  dialogVolume: 1,
};

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
  // Stores various user settings (e.g. sound volume, etc.)
  settings: Settings;
  // Tracks which journal pages the user has already seen.
  seenJournalPages: SectionName[];
}

export interface SaveDataManager {
  markLevelCompleted: (levelName: string) => void;
  markLevelChallengeCompleted: (levelName: string) => void;
  updateLevelCode: (levelName: string, code: string) => void;
  markDialogSeen: (treeName: string) => void;
  markTutorialShortSeen: (shortId: ShortId) => void;
  saveMasterVolume: (volume: number) => void;
  saveSoundEffectsVolume: (volume: number) => void;
  saveDialogVolume: (volume: number) => void;
  saveMusicVolume: (volume: number) => void;
  markJournalPageSeen: (sectionName: SectionName) => void;
}

// Actually saves the data to local storage.
// We Use debounce to prevent writing to local storage too often during
// rapid updates.
const save = debounce(
  (saveData: SaveData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
  },
  SAVE_DEBOUNCE_INTERVAL,
  { maxWait: SAVE_MAX_WAIT }
);

function migrateSaveData(saveData: SaveData): SaveData {
  const newData = clone(saveData);

  if (saveData.version < 5) {
    // For older versions, just log a warning and return the default save data.
    console.warn("Save data too old to migrate. Falling back to default.");
    return {
      version: SAVE_DATA_VERSION,
      levelStates: {},
      seenDialogTrees: [],
      seenTutorialShorts: [],
      settings: DEFUALT_SETTINGS,
      seenJournalPages: [],
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

  // Migrate from version 7 to 8.
  if (newData.version === 7) {
    newData.version = 8;
    // Version 8 added user settings.
    newData.settings = DEFUALT_SETTINGS;
  }

  // Migrate from version 8 to 9.
  if (newData.version === 8) {
    newData.version = 9;
    // Version 9 added seenJournalPages.
    newData.seenJournalPages = [];
  }

  // Migrate from version 9 to 10.
  if (newData.version === 9) {
    newData.version = 10;
    // Version 10 added dialog volume.
    newData.settings.dialogVolume = DEFUALT_SETTINGS.dialogVolume;
  }

  return newData;
}

function load(): SaveData {
  const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (rawData) {
    const saveData = JSON.parse(rawData);
    if (saveData.version === SAVE_DATA_VERSION) {
      return saveData;
    }
    return migrateSaveData(saveData);
  }
  return {
    version: SAVE_DATA_VERSION,
    levelStates: {},
    seenDialogTrees: [],
    seenTutorialShorts: [],
    settings: DEFUALT_SETTINGS,
    seenJournalPages: [],
  };
}

export const SaveDataContext = createContext<
  readonly [SaveData, SaveDataManager]
>([
  load(),
  {
    markLevelCompleted: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    markLevelChallengeCompleted: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    updateLevelCode: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    markDialogSeen: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    markTutorialShortSeen: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    saveMasterVolume: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    saveSoundEffectsVolume: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    saveDialogVolume: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    saveMusicVolume: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    markJournalPageSeen: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
  },
] as const);

export function SaveDataProvider(props: PropsWithChildren<{}>) {
  // Note(albrow): We use a combination of ref and state for represnting the save data.
  // This is admittedly a bit of a hack. 🐉
  //
  // The ref is used internally in SaveDataProvider to ensure that multiple updates
  // to the save data to not cause race conditions. This is necessary because refs
  // update immediately in React, but state does not.
  //
  // The state is used externally by components which need to read save data. It will
  // trigger a re-render of those components whenever the save data changes. The state is
  // also used internally by SaveDataProvider to trigger actually saving data to local
  // storage.
  const saveDataRef = useRef<SaveData>(load());
  const [saveData, __internalSetSaveData] = useState(saveDataRef.current);

  // Updates both the ref and state. This should be called whenever we want to update
  // save data. DO NOT set the ref directly or call __internalSetSaveData directly.
  const setSaveData = useCallback(
    (newSaveData: SaveData) => {
      saveDataRef.current = newSaveData;
      __internalSetSaveData(newSaveData);
    },
    [__internalSetSaveData, saveDataRef]
  );

  // Automatically save the save data to local storage whenever it changes.
  useEffect(() => {
    // Use setTimeout to write to local storage asynchronously.
    // This way we don't block the main thread.
    setTimeout(() => {
      save(saveData);
    }, 0);
  }, [saveData]);

  const markLevelCompleted = useCallback(
    (levelName: string) => {
      const newSaveData = clone(saveDataRef.current);
      newSaveData.levelStates[levelName] = {
        completed: true,
        challengeCompleted:
          newSaveData.levelStates[levelName]?.challengeCompleted || false,
        code: newSaveData.levelStates[levelName]?.code || "",
      };
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const markLevelChallengeCompleted = useCallback(
    (levelName: string) => {
      const newSaveData = clone(saveDataRef.current);
      newSaveData.levelStates[levelName] = {
        completed: newSaveData.levelStates[levelName]?.completed || false,
        challengeCompleted: true,
        code: newSaveData.levelStates[levelName]?.code || "",
      };
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const updateLevelCode = useCallback(
    (levelName: string, code: string) => {
      const newSaveData = clone(saveDataRef.current);
      newSaveData.levelStates[levelName] = {
        completed: newSaveData.levelStates[levelName]?.completed || false,
        challengeCompleted:
          newSaveData.levelStates[levelName]?.challengeCompleted || false,
        code,
      };
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const markDialogSeen = useCallback(
    (treeName: string) => {
      const newSaveData = clone(saveDataRef.current);
      if (!newSaveData.seenDialogTrees.includes(treeName)) {
        newSaveData.seenDialogTrees.push(treeName);
      }
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const markTutorialShortSeen = useCallback(
    (shortId: ShortId) => {
      const newSaveData = clone(saveDataRef.current);
      if (!newSaveData.seenTutorialShorts.includes(shortId)) {
        newSaveData.seenTutorialShorts.push(shortId);
      }
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const saveMasterVolume = useCallback(
    (volume: number) => {
      const newSaveData = clone(saveDataRef.current);
      newSaveData.settings.masterVolume = volume;
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const saveSoundEffectsVolume = useCallback(
    (volume: number) => {
      const newSaveData = clone(saveDataRef.current);
      newSaveData.settings.soundEffectsVolume = volume;
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const saveDialogVolume = useCallback(
    (volume: number) => {
      const newSaveData = clone(saveDataRef.current);
      newSaveData.settings.dialogVolume = volume;
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const saveMusicVolume = useCallback(
    (volume: number) => {
      const newSaveData = clone(saveDataRef.current);
      newSaveData.settings.musicVolume = volume;
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const markJournalPageSeen = useCallback(
    (sectionName: SectionName) => {
      const newSaveData = clone(saveDataRef.current);
      if (!newSaveData.seenJournalPages.includes(sectionName)) {
        newSaveData.seenJournalPages.push(sectionName);
      }
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const providerValue = useMemo(
    () =>
      [
        saveData,
        {
          markLevelCompleted,
          markLevelChallengeCompleted,
          updateLevelCode,
          markDialogSeen,
          markTutorialShortSeen,
          saveMasterVolume,
          saveSoundEffectsVolume,
          saveDialogVolume,
          saveMusicVolume,
          markJournalPageSeen,
        },
      ] as const,
    [
      saveData,
      markLevelCompleted,
      markLevelChallengeCompleted,
      updateLevelCode,
      markDialogSeen,
      markTutorialShortSeen,
      saveMasterVolume,
      saveSoundEffectsVolume,
      saveDialogVolume,
      saveMusicVolume,
      markJournalPageSeen,
    ]
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

    describe("save", async () => {
      it("saves the given save data to localStorage", async () => {
        const saveData: SaveData = {
          version: SAVE_DATA_VERSION,
          levelStates: {
            movement_part_one: {
              completed: false,
              code: `say("hello");`,
            },
            fuel_part_two: {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
          seenTutorialShorts: ["how_to_run_code"],
          settings: DEFUALT_SETTINGS,
          seenJournalPages: ["functions", "comments"],
        };
        save(saveData);
        // Wait for debounce
        await sleep(SAVE_DEBOUNCE_INTERVAL + 10);
        expect(
          JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)!)
        ).toStrictEqual(saveData);
      });
    });

    describe("load", () => {
      it("returns the default save data if there is no save data in localStorage", () => {
        expect(load()).toStrictEqual({
          version: SAVE_DATA_VERSION,
          levelStates: {},
          seenDialogTrees: [],
          seenTutorialShorts: [],
          settings: DEFUALT_SETTINGS,
          seenJournalPages: [],
        } as SaveData);
      });

      it("loads the save data from localStorage", () => {
        const saveData: SaveData = {
          version: SAVE_DATA_VERSION,
          levelStates: {
            movement_part_one: {
              completed: false,
              code: `say("hello");`,
            },
            fuel_part_two: {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
          seenTutorialShorts: ["how_to_run_code"],
          settings: DEFUALT_SETTINGS,
          seenJournalPages: ["functions", "comments"],
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
