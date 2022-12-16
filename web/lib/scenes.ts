import {
  // eslint-disable-next-line camelcase
  get_level_data,
  LevelData,
} from "../../elara-lib/pkg";

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

export const LEVELS = [
  levelData.get("hello_world")!,
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
