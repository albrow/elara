import {
  // eslint-disable-next-line camelcase
  get_level_data,
  LevelData,
} from "../../elara-lib/pkg";

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

export const LEVELS = [
  levelData.get("movement")!,
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
    name: `Level 1: ${LEVELS[1].name}`,
    route: "/level/1",
  },
  {
    type: "level",
    name: `Level 2: ${LEVELS[2].name}`,
    route: "/level/2",
  },
  {
    type: "journal",
    name: "Journal: Function Outputs",
    route: "/journal/concepts/function_outputs",
  },
  {
    type: "journal",
    name: "Journal: Variables",
    route: "/journal/concepts/variables",
  },
  {
    type: "level",
    name: `Level 3: ${LEVELS[3].name}`,
    route: "/level/3",
  },
];

export const getSceneIndexFromRoute = (route: string): number | undefined =>
  SCENES.findIndex((scene) => scene.route === route);
