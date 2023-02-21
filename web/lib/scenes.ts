import {
  // eslint-disable-next-line camelcase
  get_level_data,
  LevelData,
} from "../../elara-lib/pkg";
import { ShortId } from "./tutorial_shorts";

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

// A special level used for runnable examples.
export const SANDBOX_LEVEL = levelData.get("sandbox")!;

export type SceneType = "level" | "dialogue" | "journal";

export interface Scene {
  type: SceneType;
  name: string;
  route: string;
  level?: LevelData;
  tutorialShorts?: ShortId[];
}

function sceneFromLevelName(shortName: string): Scene {
  const level = levelData.get(shortName);
  if (!level) {
    throw new Error(`No level with short name ${shortName}`);
  }
  return {
    type: "level",
    name: `Level: ${level.name}`,
    route: `/level/${shortName}`,
    level,
  };
}

export const SCENES: Scene[] = [
  {
    type: "dialogue",
    name: "Introduction",
    route: "/dialog/intro",
  },
  {
    ...sceneFromLevelName("movement"),
    tutorialShorts: [
      "how_to_run_code",
      "where_to_find_objectives",
      "how_to_pause_and_step",
      "how_to_see_errors",
    ],
  },
  {
    type: "journal",
    name: "Journal: Functions",
    route: "/journal/concepts/functions",
  },
  {
    type: "journal",
    name: "Journal: Comments",
    route: "/journal/concepts/comments",
  },
  {
    ...sceneFromLevelName("movement_part_two"),
    tutorialShorts: ["how_to_navigate_scenes"],
  },
  {
    ...sceneFromLevelName("fuel_part_one"),
    tutorialShorts: ["moving_takes_fuel", "how_to_get_more_fuel"],
  },
  {
    type: "journal",
    name: "Journal: Strings",
    route: "/journal/concepts/strings",
  },
  sceneFromLevelName("gates"),
  {
    type: "journal",
    name: "Journal: Variables",
    route: "/journal/concepts/variables",
  },
  {
    type: "journal",
    name: "Journal: Function Outputs",
    route: "/journal/concepts/function_outputs",
  },
  {
    ...sceneFromLevelName("gate_and_terminal"),
    tutorialShorts: ["how_to_use_data_terminals"],
  },
  {
    type: "journal",
    name: "Journal: Loops",
    route: "/journal/concepts/loops",
  },
  sceneFromLevelName("loops_part_one"),
  sceneFromLevelName("loops_part_two"),
  {
    type: "journal",
    name: "Journal: Comparisons",
    route: "/journal/concepts/comparisons",
  },
  {
    type: "journal",
    name: "Journal: If Statements",
    route: "/journal/concepts/if_statements",
  },
  sceneFromLevelName("seismic_activity"),
];

const LEVELS_ONLY = SCENES.filter((s) => s.type === "level");

export const getSceneIndexFromRoute = (route: string): number | undefined =>
  SCENES.findIndex((scene) => scene.route === route);

export const getLevelIndexFromScene = (scene: Scene): number | undefined =>
  LEVELS_ONLY.indexOf(scene);

export const getSceneFromRoute = (route: string): Scene | undefined =>
  SCENES.find((scene) => scene.route === route);

export const getNextSceneFromRoute = (route: string): Scene | undefined => {
  const index = getSceneIndexFromRoute(route);
  if (index === undefined) {
    return undefined;
  }
  if (index === SCENES.length - 1) {
    return undefined;
  }
  return SCENES[index + 1];
};
