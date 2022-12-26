import {
  // eslint-disable-next-line camelcase
  get_level_data,
  LevelData,
} from "../../elara-lib/pkg";

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

export const LEVELS = [
  // levelData.get("hello_world")!,
  levelData.get("movement")!,
  levelData.get("expressions")!,
  levelData.get("math_expressions")!,
  levelData.get("fuel_part_one")!,
  levelData.get("gates")!,
  levelData.get("variables")!,
  levelData.get("gate_and_terminal")!,
  levelData.get("enemies_part_one")!,
  levelData.get("loops_part_one")!,
  levelData.get("loops_part_two")!,
  levelData.get("comparisons")!,
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
    route: "/journal/concepts/Functions",
  },
];

export const getSceneIndexFromRoute = (route: string): number | undefined =>
  SCENES.findIndex((scene) => scene.route === route);
