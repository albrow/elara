import {
  // eslint-disable-next-line camelcase
  get_level_data,
  LevelData,
} from "../../elara-lib/pkg";

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

// A special level used for runnable examples.
export const SANDBOX_LEVEL = levelData.get("sandbox")!;

export const LEVELS = [
  levelData.get("movement")!,
  levelData.get("movement_part_two")!,
  levelData.get("fuel_part_one")!,
  levelData.get("gates")!,
  levelData.get("gate_and_terminal")!,
  levelData.get("enemies_part_one")!,
  levelData.get("loops_part_one")!,
  levelData.get("loops_part_two")!,
  levelData.get("glitches_part_one")!,
  levelData.get("glitches_part_two")!,
];

export type SceneType = "level" | "dialogue" | "journal";

export interface Scene {
  type: SceneType;
  name: string;
  route: string;
  level?: LevelData;
}

export const SCENES: Scene[] = [
  {
    type: "dialogue",
    name: "Introduction",
    route: "/dialog/intro",
  },
  {
    type: "level",
    name: `Level 0: ${LEVELS[0].name}`,
    route: "/level/0",
    level: LEVELS[0],
  },
  {
    type: "level",
    name: `Level 1: ${LEVELS[1].name}`,
    route: "/level/1",
    level: LEVELS[1],
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
    type: "level",
    name: `Level 2: ${LEVELS[2].name}`,
    route: "/level/2",
    level: LEVELS[2],
  },
  {
    type: "journal",
    name: "Journal: Strings",
    route: "/journal/concepts/strings",
  },
  {
    type: "level",
    name: `Level 3: ${LEVELS[3].name}`,
    route: "/level/3",
    level: LEVELS[3],
  },
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
    type: "level",
    name: `Level 4: ${LEVELS[4].name}`,
    route: "/level/4",
    level: LEVELS[4],
  },
  {
    type: "level",
    name: `Level 5: ${LEVELS[5].name}`,
    route: "/level/5",
    level: LEVELS[5],
  },
];

export const getSceneIndexFromRoute = (route: string): number | undefined =>
  SCENES.findIndex((scene) => scene.route === route);

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
