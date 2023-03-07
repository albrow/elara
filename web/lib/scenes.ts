import { titleCase } from "title-case";
import type { State } from "router5";

import {
  // eslint-disable-next-line camelcase
  get_level_data,
  LevelData,
} from "../../elara-lib/pkg";
import { ShortId } from "./tutorial_shorts";
import { TREES } from "./dialog_trees";

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

// A special level used for runnable examples.
export const SANDBOX_LEVEL = levelData.get("sandbox")!;

export type SceneType = "level" | "dialog" | "journal";

export interface Scene {
  type: SceneType;
  name: string;
  routeName: string;
  routeParams?: Record<string, any>;
  level?: LevelData;
  tutorialShorts?: ShortId[];
}

function levelScene(shortName: string, tutorialShorts?: ShortId[]): Scene {
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
function demoLevelScene(shortName: string): Scene {
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

function dialogScene(treeName: keyof typeof TREES): Scene {
  return {
    type: "dialog",
    name: `${TREES[treeName].name}`,
    routeName: "dialog",
    routeParams: { treeName },
  };
}

function journalScene(sectionName: string): Scene {
  return {
    type: "journal",
    name: titleCase(sectionName.split("_").join(" ")),
    routeName: "journal_section",
    routeParams: { sectionName },
  };
}

export const SCENES: Scene[] = [
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

export const LEVELS = SCENES.filter((s) => s.type === "level");
export const JOURNAL_PAGES = SCENES.filter((s) => s.type === "journal");

// TODO(albrow): Wrap this up in a scene provider.
export const getSceneIndexFromRoute = (route: State): number | undefined => {
  const givenParamsJSON = JSON.stringify(route.params);
  return SCENES.findIndex(
    (scene) =>
      scene.routeName === route.name &&
      JSON.stringify(scene.routeParams) === givenParamsJSON
  );
};

export const getLevelIndexFromScene = (scene: Scene): number | undefined =>
  LEVELS.indexOf(scene);

export const getSceneFromRoute = (route: State): Scene | undefined => {
  const index = getSceneIndexFromRoute(route);
  if (index === undefined) {
    return undefined;
  }
  return SCENES[index];
};

export const getNextSceneFromRoute = (route: State): Scene | undefined => {
  const index = getSceneIndexFromRoute(route);
  if (index === undefined) {
    return undefined;
  }
  if (index === SCENES.length - 1) {
    return undefined;
  }
  return SCENES[index + 1];
};
