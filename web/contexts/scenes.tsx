import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { titleCase } from "title-case";
import type { State } from "router5";

import { useRouteNode, useRouter } from "react-router5";
import {
  // eslint-disable-next-line camelcase
  get_level_data,
  LevelData,
} from "../../elara-lib/pkg";
import { ShortId } from "../lib/tutorial_shorts";
import { TREES } from "../lib/dialog_trees";
import { LevelState, useSaveData } from "./save_data";

export type SceneType = "level" | "dialog" | "journal";

interface RawScene {
  type: SceneType;
  name: string;
  routeName: string;
  routeParams?: Record<string, any>;
  level?: LevelData;
  tutorialShorts?: ShortId[];
}

export interface Scene extends RawScene {
  unlocked: boolean;
  index: number;
  levelIndex?: number;
  nextScene?: Scene;
}

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

// A special level used for runnable examples.
export const SANDBOX_LEVEL = levelData.get("sandbox")!;

function levelScene(shortName: string, tutorialShorts?: ShortId[]): RawScene {
  const level = levelData.get(shortName);
  if (!level) {
    throw new Error(`No level with short name ${shortName}`);
  }
  return {
    type: "level",
    name: `Level: ${level.name}`,
    routeName: "level",
    routeParams: { levelId: shortName },
    level,
    tutorialShorts,
  };
}

// eslint-disable-next-line no-unused-vars
function demoLevelScene(shortName: string): RawScene {
  const level = levelData.get(shortName);
  if (!level) {
    throw new Error(`No level with short name ${shortName}`);
  }
  return {
    type: "level",
    name: `(DEMO) Level: ${level.name}`,
    routeName: "demo_level",
    routeParams: { levelId: shortName },
    level,
  };
}

function dialogScene(treeName: keyof typeof TREES): RawScene {
  return {
    type: "dialog",
    name: `${TREES[treeName].name}`,
    routeName: "dialog",
    routeParams: { treeName },
  };
}

function journalScene(sectionName: string): RawScene {
  return {
    type: "journal",
    name: titleCase(sectionName.split("_").join(" ")),
    routeName: "journal_section",
    routeParams: { sectionName },
  };
}

const RAW_SCENES: RawScene[] = [
  dialogScene("intro"),
  levelScene("movement", [
    "how_to_run_code",
    "how_to_pause_and_step",
    "where_to_find_objectives",
    "how_to_see_errors",
  ]),
  journalScene("functions"),
  journalScene("comments"),
  levelScene("movement_part_two", ["how_to_navigate_scenes"]),
  levelScene("fuel_part_one", ["moving_takes_fuel", "how_to_get_more_fuel"]),
  journalScene("strings"),
  journalScene("loops"),
  levelScene("loops_part_one"),
  levelScene("loops_part_two"),
  levelScene("gates"),
  journalScene("variables"),
  journalScene("function_outputs"),

  levelScene("gate_and_terminal", ["how_to_use_data_terminals"]),
  levelScene("gate_and_terminal_part_two"),
  // Temporarily disabled for the sake of saving time during playtesting.
  // levelScene("gate_and_terminal_part_three"),
  journalScene("comparisons"),
  journalScene("if_statements"),
  levelScene("seismic_activity"),
  levelScene("partly_disabled_movement", ["how_to_view_function_list"]),
  journalScene("creating_functions"),
  levelScene("reimplement_turn_right"),
];

const getLevelIndexFromScene = (
  allScenes: RawScene[],
  scene: RawScene
): number | undefined => {
  const levels = allScenes.filter((s) => s.type === "level");
  return levels.indexOf(scene);
};

// Returns the *scene index* of the last uncompleted level, or the last
// level index if all levels have been completed.
function getLastUncompletedLevelIndex(
  levelStates: Record<string, LevelState>,
  allScenes: RawScene[]
) {
  for (let i = 0; i < allScenes.length; i += 1) {
    const scene = allScenes[i];
    if (scene.type === "level") {
      const levelName = scene.level?.short_name;
      const levelState = levelStates[levelName as string];
      if (levelState == null || !levelState.completed) {
        return i;
      }
    }
  }
  return allScenes.length - 1;
}

function processScenes(
  levelStates: Record<string, LevelState>,
  scenes: RawScene[]
): Scene[] {
  // The cutoff is the index of the latest uncompleted level.
  // Everything after the cutoff is locked.
  const cutoff = getLastUncompletedLevelIndex(levelStates, scenes);
  const result: Scene[] = scenes.map((scene, index) => ({
    ...scene,
    index,
    unlocked: index <= cutoff,
    levelIndex: getLevelIndexFromScene(scenes, scene),
  }));
  // eslint-disable-next-line no-restricted-syntax
  for (const s of result) {
    if (s.index < result.length - 1) {
      s.nextScene = result[s.index + 1];
    }
  }
  return result;
}

function getSceneIndexFromRoute(
  scenes: Scene[],
  route: State
): number | undefined {
  const givenParamsJSON = JSON.stringify(route.params);
  return scenes.findIndex(
    (scene) =>
      scene.routeName === route.name &&
      JSON.stringify(scene.routeParams) === givenParamsJSON
  );
}

function getSceneFromRoute(scenes: Scene[], route: State): Scene | null {
  const index = getSceneIndexFromRoute(scenes, route);
  if (index === undefined) {
    return null;
  }
  return scenes[index];
}

export const ScenesContext = createContext<Scene[]>([]);

// A custom hook that returns all scenes.
export const useScenes = () => useContext(ScenesContext);

// A custom hook that returns only the level scenes.
export const useLevels = () =>
  useContext(ScenesContext).filter((s) => s.type === "level");

// A custom hook that returns only the journal scenes.
export const useJournalPages = () =>
  useContext(ScenesContext).filter((s) => s.type === "journal");

// A custom hook that always returns the current scene.
export function useCurrScene() {
  const scenes = useScenes();
  const { route } = useRouteNode("");
  const [currScene, setCurrScene] = useState<Scene | null>(
    getSceneFromRoute(scenes, route)
  );
  useEffect(() => {
    setCurrScene(getSceneFromRoute(scenes, route));
  }, [route, scenes]);

  return currScene;
}

// A custom hook that allows for navigating between scenes.
export function useSceneNavigator() {
  const currScene = useCurrScene();
  const router = useRouter();
  const navigateToNextScene = useCallback(() => {
    if (!currScene) {
      throw new Error("Could not get current scene.");
    }
    const { nextScene } = currScene;
    if (nextScene == null) {
      throw new Error("Could not get next scene.");
    }
    router.navigate(nextScene.routeName, nextScene.routeParams ?? {});
  }, [currScene, router]);
  return { navigateToNextScene };
}

// A custom hook that returns the current level or, if the current
// scene is not a level returns null.
export function useCurrLevel() {
  const currScene = useCurrScene();
  if (!currScene) {
    return null;
  }
  if (currScene.type === "level") {
    return currScene.level;
  }
  return null;
}

export function ScenesProvider(props: PropsWithChildren<{}>) {
  const [saveData, _] = useSaveData();
  const providerValue = useMemo(
    () => processScenes(saveData.levelStates, RAW_SCENES),
    [saveData.levelStates]
  );

  return (
    <ScenesContext.Provider value={providerValue}>
      {props.children}
    </ScenesContext.Provider>
  );
}

// TODO(albrow): Uncomment this if we get vitest working.
// if (import.meta.vitest) {
//   const { test, expect } = import.meta.vitest;

//   test("processScenes", () => {
//     const scenes = processScenes([
//       { type: "level", name: "Level 1", routeName: "level" },
//       { type: "level", name: "Level 2", routeName: "level" },
//       { type: "level", name: "Level 3", routeName: "level" },
//     ]);
//     const expectedScenes: SceneWithMeta[] = [
//       { type: "level", name: "Level 1", routeName: "level", index: 0 },
//       { type: "level", name: "Level 2", routeName: "level", index: 1 },
//       { type: "level", name: "Level 3", routeName: "level", index: 2 },
//     ];
//     // eslint-disable-next-line prefer-destructuring
//     expectedScenes[0].nextScene = expectedScenes[1];
//     // eslint-disable-next-line prefer-destructuring
//     expectedScenes[1].nextScene = expectedScenes[2];
//     expect(scenes).toStrictEqual([expectedScenes]);
//   });
// }
