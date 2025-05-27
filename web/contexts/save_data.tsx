import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  MutableRefObject,
  useState,
  useRef,
} from "react";
import clone from "clone";
import debounce from "lodash.debounce";

import { ShortId } from "../lib/tutorial_shorts";
import { sleep } from "../lib/utils";
import { SectionName } from "../components/journal/sections";

export const SAVE_DATA_VERSION = 18;
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
  // Which functions have been unlocked.
  unlockedFunctions: string[];
  // When the save data was last committed to local storage.
  // Measured as milliseconds since the UNIX epoch.
  lastUpdated?: number;
  // Which cutscenes have already been seen.
  seenCutscenes: string[];
  // The latest version of the changelog that the user has seen.
  // Undefined if the user has not seen the changelog or if they saw it
  // before we started tracking this.
  lastSeenChangelogVersion?: string;
}

const DEFAULT_SETTINGS: Settings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  soundEffectsVolume: 1,
  dialogVolume: 1,
};

// These functions are always unlocked at the start of the game.
const DEFAULT_UNLOCKED_FUNCTIONS = [
  "move_forward",
  "move_backward",
  "turn_left",
  "turn_right",
];

const DEFAULT_SAVE_DATA: SaveData = {
  version: SAVE_DATA_VERSION,
  levelStates: {},
  seenDialogTrees: [],
  seenTutorialShorts: [],
  settings: DEFAULT_SETTINGS,
  seenJournalPages: [],
  unlockedFunctions: DEFAULT_UNLOCKED_FUNCTIONS,
  seenCutscenes: [],

  // lastUpdated is intentionally omitted from the default save data.
  // it will be set automatically when the save data is committed to
  // local storage.
};

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
  resetAllSaveData: () => void;
  unlockFunctions: (newFunctions: string[]) => void;
  markCutsceneSeen: (cutsceneId: string) => void;
  markChangelogSeen: () => void;
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
    return DEFAULT_SAVE_DATA;
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
    newData.settings = DEFAULT_SETTINGS;
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
    newData.settings.dialogVolume = DEFAULT_SETTINGS.dialogVolume;
  }

  // Migrate from version 10 to 11.
  if (newData.version === 10) {
    newData.version = 11;
    // Version 11 added lastUpdated.
    newData.lastUpdated = Date.now();
  }

  if (newData.version === 11) {
    newData.version = 12;
    const unlockedFunctions = DEFAULT_UNLOCKED_FUNCTIONS;
    // Version 12 added unlockedFunctions.
    // We need to add unlocked functions based on which journal pages and
    // levels the user has already completed.
    if (newData.levelStates.movement?.completed) {
      unlockedFunctions.push("say");
    }
    if (newData.levelStates.loops_part_two?.completed) {
      unlockedFunctions.push("press_button");
    }
    if (newData.levelStates.button_and_gate?.completed) {
      unlockedFunctions.push("read_data");
      unlockedFunctions.push("get_orientation");
    }

    // Note(albrow): We use a Set here to ensure that we don't add any
    // duplicate functions. Seems to be an issue if hooks trigger more
    // than once in rapid succession. In other words, using Set makes
    // this function idempotent.
    newData.unlockedFunctions = [...new Set(unlockedFunctions)];
  }

  if (newData.version === 12) {
    newData.version = 13;

    // Version 13 renamed some levels:
    //
    //   fuel_part_one -> energy_part_one
    //   astroid_strike -> asteroid_strike
    //   astroid_strike_part_two -> asteroid_strike_part_two
    //
    if (newData.levelStates.fuel_part_one) {
      newData.levelStates.energy_part_one = newData.levelStates.fuel_part_one;
      delete newData.levelStates.fuel_part_one;
    }
    if (newData.levelStates.astroid_strike) {
      newData.levelStates.asteroid_strike = newData.levelStates.astroid_strike;
      delete newData.levelStates.astroid_strike;
    }
    if (newData.levelStates.astroid_strike_part_two) {
      newData.levelStates.asteroid_strike_part_two =
        newData.levelStates.astroid_strike_part_two;
      delete newData.levelStates.astroid_strike_part_two;
    }

    // We also renamed the dialog tree:
    //
    //   level_astroid_strike -> level_asteroid_strike
    //
    newData.seenDialogTrees = newData.seenDialogTrees.map((treeName) =>
      treeName === "level_astroid_strike" ? "level_asteroid_strike" : treeName
    );
  }

  if (newData.version === 13) {
    newData.version = 14;

    // Version 14 renamed "data terminals" to "data points".
    // This affects some levels and dialog trees.

    // levels:
    //
    //  - data_terminals_part_one
    //  - gate_and_terminal
    //  - gate_and_terminal_part_two
    //  - gate_and_terminal_part_three
    //
    if (newData.levelStates.data_terminals_part_one) {
      newData.levelStates.data_points_part_one =
        newData.levelStates.data_terminals_part_one;
      delete newData.levelStates.data_terminals_part_one;
    }
    if (newData.levelStates.gate_and_terminal) {
      newData.levelStates.gate_and_data_point =
        newData.levelStates.gate_and_terminal;
      delete newData.levelStates.gate_and_terminal;
    }
    if (newData.levelStates.gate_and_terminal_part_two) {
      newData.levelStates.gate_and_data_point_part_two =
        newData.levelStates.gate_and_terminal_part_two;
      delete newData.levelStates.gate_and_terminal_part_two;
    }
    if (newData.levelStates.gate_and_terminal_part_three) {
      newData.levelStates.gate_and_data_point_part_three =
        newData.levelStates.gate_and_terminal_part_three;
      delete newData.levelStates.gate_and_terminal_part_three;
    }

    // Tutorial shorts:
    //
    //   - how_to_use_data_terminals
    //
    newData.seenTutorialShorts = newData.seenTutorialShorts.map((shortId) =>
      shortId === "how_to_use_data_terminals"
        ? "how_to_use_data_points"
        : shortId
    );

    // Dialog trees:
    //
    //   - level_data_terminals_part_one
    //   - level_gate_and_terminal
    //   - level_gate_and_terminal_part_two
    //   - level_gate_and_terminal_part_three
    //
    newData.seenDialogTrees = newData.seenDialogTrees.map((treeName) => {
      if (treeName === "level_data_terminals_part_one") {
        return "level_data_points_part_one";
      }
      if (treeName === "level_gate_and_terminal") {
        return "level_gate_and_data_point";
      }
      if (treeName === "level_gate_and_terminal_part_two") {
        return "level_gate_and_data_point_part_two";
      }
      if (treeName === "level_gate_and_terminal_part_three") {
        return "level_gate_and_data_point_part_three";
      }
      return treeName;
    });
  }

  // Version 15 changed the default musicVolume from 0.8 to 0.6.
  // We also want to change the user's current musicVolume to 0.6
  // if it was previously set to anything above 0.6. In other words,
  // 0.6 is the new default maximum volume (but users can still
  // increase it later if they want to). The reason for this change is
  // that the new mastered music is slightly louder than before.
  if (newData.version === 14) {
    newData.version = 15;

    if (newData.settings.musicVolume > 0.6) {
      newData.settings.musicVolume = 0.6;
    }
  }

  // Version 16 added seenCutscenes.
  if (newData.version === 15) {
    newData.version = 16;
    // Since some prior save data exists, we can safely assume that the
    // intro cutscene has already been seen.
    newData.seenCutscenes = ["intro"];
  }

  // Version 17 added two new cutscenes. They should be marked as seen if
  // the user has already the levels that come immediately afterwards.
  if (newData.version === 16) {
    newData.version = 17;
    if (newData.levelStates.partly_disabled_movement?.completed) {
      newData.seenCutscenes.push("grover_damaged");
    }
    if (newData.levelStates.telepad_part_one?.completed) {
      newData.seenCutscenes.push("grover_repaired");
    }
  }

  // Version 18 includes breaking changes to the level "asteroid_strike".
  // Old code will no longer work, so we reset to the starting state for
  // this level.
  if (newData.version === 17) {
    newData.version = 18;
    delete newData.levelStates.asteroid_strike;
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
  return DEFAULT_SAVE_DATA;
}
/**
 * Returns [saveData, saveDataManager, saveDataRef].
 *
 * - `saveData` should be used for components that need to re-render whenever state changes.
 * - `saveDataManager` has a number of utility functions used for updating save data.
 * - `saveDataRef` should be used with great care and contains the latest value of saveData.
 *   It *won't* trigger a re-render when it changes. Typically this should be used in hooks.
 *
 */
export const SaveDataContext = createContext<
  readonly [SaveData, SaveDataManager, MutableRefObject<SaveData> | null]
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
    resetAllSaveData: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    unlockFunctions: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    markCutsceneSeen: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
    markChangelogSeen: () => {
      throw new Error("useSaveData must be used within a SaveDataContext");
    },
  },
  null,
] as const);

export function SaveDataProvider(props: PropsWithChildren<{}>) {
  // Note(albrow): We use a combination of ref and state for representing the save data.
  // This is admittedly a bit of a hack. 🐉
  //
  // The ref is used internally in SaveDataProvider to ensure that multiple
  // updates to the save data to not cause race conditions. It may also be used
  // in certain hooks, but should be used this way with caution! This is
  // necessary because refs update immediately in React, but state does not.
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
      saveDataRef.current = {
        ...newSaveData,
        lastUpdated: Date.now(),
      };
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

  const resetAllSaveData = useCallback(() => {
    const oldSaveData = clone(saveDataRef.current);
    const newSaveData = DEFAULT_SAVE_DATA;
    // Preserve settings and lastSeenChangelogVersion.
    newSaveData.settings = oldSaveData.settings;
    newSaveData.lastSeenChangelogVersion = oldSaveData.lastSeenChangelogVersion;
    setSaveData(newSaveData);
  }, [setSaveData]);

  // TODO(albrow): Use a set everywhere else to prevent duplicates being
  // added in save data arrays.
  const unlockFunctions = useCallback(
    (newFunctions: string[]) => {
      const newSaveData = clone(saveDataRef.current);
      const unlockedFunctions = new Set(newSaveData.unlockedFunctions);
      newFunctions.forEach((f) => unlockedFunctions.add(f));
      newSaveData.unlockedFunctions = [...unlockedFunctions];
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const markCutsceneSeen = useCallback(
    (cutsceneId: string) => {
      const newSaveData = clone(saveDataRef.current);
      const seenCutscenes = new Set(newSaveData.seenCutscenes);
      seenCutscenes.add(cutsceneId);
      newSaveData.seenCutscenes = [...seenCutscenes];
      setSaveData(newSaveData);
    },
    [setSaveData]
  );

  const markChangelogSeen = useCallback(() => {
    const newSaveData = clone(saveDataRef.current);
    newSaveData.lastSeenChangelogVersion = APP_VERSION;
    setSaveData(newSaveData);
  }, [setSaveData]);

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
          resetAllSaveData,
          unlockFunctions,
          markCutsceneSeen,
          markChangelogSeen,
        },
        saveDataRef,
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
      resetAllSaveData,
      unlockFunctions,
      markCutsceneSeen,
      markChangelogSeen,
      saveDataRef,
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
            energy_part_one: {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
          seenTutorialShorts: ["how_to_run_code"],
          settings: DEFAULT_SETTINGS,
          seenJournalPages: ["functions", "comments"],
          unlockedFunctions: [
            ...DEFAULT_UNLOCKED_FUNCTIONS,
            "say",
            "press_button",
          ],
          seenCutscenes: ["intro", "midgame"],
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
          settings: DEFAULT_SETTINGS,
          seenJournalPages: [],
          unlockedFunctions: DEFAULT_UNLOCKED_FUNCTIONS,
          seenCutscenes: [],
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
            energy_part_one: {
              completed: false,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["movement"],
          seenTutorialShorts: ["how_to_run_code"],
          settings: DEFAULT_SETTINGS,
          seenJournalPages: ["functions", "comments"],
          unlockedFunctions: [
            ...DEFAULT_UNLOCKED_FUNCTIONS,
            "say",
            "press_button",
          ],
          seenCutscenes: ["intro", "midgame"],
        };
        window.localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(saveData)
        );

        expect(load()).toStrictEqual(saveData);
      });
    });

    describe("load", () => {
      it("migrates from version 11 to the latest version", () => {
        const oldData = {
          version: 11,
          levelStates: {
            movement: {
              completed: true,
              code: `say("hello");`,
            },
            movement_part_two: {
              completed: true,
              code: `move_right(5);`,
            },
            energy_part_one: {
              completed: true,
              code: `move_right(5);`,
            },
            loops_part_one: {
              completed: true,
              code: `move_right(5);`,
            },
            loops_part_two: {
              completed: true,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["intro"],
          seenTutorialShorts: [],
          settings: { ...DEFAULT_SETTINGS, musicVolume: 0.9 },
          seenJournalPages: ["functions", "comments", "strings", "loops"],
        };

        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(oldData));

        const expectedData: SaveData = {
          version: SAVE_DATA_VERSION,
          levelStates: {
            movement: {
              completed: true,
              code: `say("hello");`,
            },
            movement_part_two: {
              completed: true,
              code: `move_right(5);`,
            },
            energy_part_one: {
              completed: true,
              code: `move_right(5);`,
            },
            loops_part_one: {
              completed: true,
              code: `move_right(5);`,
            },
            loops_part_two: {
              completed: true,
              code: `move_right(5);`,
            },
          },
          seenDialogTrees: ["intro"],
          seenTutorialShorts: [],
          settings: DEFAULT_SETTINGS,
          seenJournalPages: ["functions", "comments", "strings", "loops"],
          unlockedFunctions: [
            ...DEFAULT_UNLOCKED_FUNCTIONS,
            "say",
            "press_button",
          ],
          seenCutscenes: ["intro"],
        };

        const gotData = load();

        expect(gotData).toStrictEqual(expectedData);
      });
    });
  });
}
