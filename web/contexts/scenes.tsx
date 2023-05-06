import {
  PropsWithChildren,
  createContext,
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
  hints?: string[];
}

export interface Scene extends RawScene {
  unlocked: boolean;
  completed: boolean;
  challengeCompleted: boolean;
  index: number;
  levelIndex?: number;
  nextScene?: Scene;
}

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

// Special levels used for runnable examples.
export const SANDBOX_LEVEL = levelData.get("sandbox")!;
export const SANDBOX_WITH_TERMINAL_LEVEL = levelData.get(
  "sandbox_with_data_terminal"
)!;

function levelScene(
  shortName: string,
  tutorialShorts?: ShortId[],
  hints?: string[]
): RawScene {
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
    hints,
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
  levelScene(
    "movement",
    [
      "how_to_run_code",
      "how_to_pause_and_step",
      "where_to_find_objectives",
      "how_to_see_errors",
    ],
    [
      "Find the line of code that says `move_forward(1);`. Try changing the number `1` to a different number.",
      "The `turn_right` function doesn't expect any inputs, so you don't need to put anything in between the parentheses. (You'll learn more about function inputs soon.)",
    ]
  ),
  journalScene("functions"),
  journalScene("comments"),
  levelScene(
    "movement_part_two",
    ["how_to_navigate_scenes", "how_to_view_function_list", "extra_challenges"],
    [
      "Use the `move_forward` and `turn_left` functions to move the rover to the goal.",
      "Don't forget to put a semicolon (`;`) at the end of each function call.",
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
    ]
  ),
  levelScene("fuel_part_one", ["moving_takes_fuel", "how_to_get_more_fuel"]),
  journalScene("strings"),
  journalScene("loops"),
  levelScene(
    "loops_part_one",
    [],
    [
      `You can use the "reset" (🔄) button to reset to the starting code for this level.`,
      "Line 6 of the starting code says `turn_left();`. Try changing that line to something else.",
      `If you're confused about what's going on, try using the "skip forward" (⏭️) and "skip back" (⏮️) buttons to run the code one line at a time.`,
    ]
  ),
  levelScene(
    "loops_part_two",
    [],
    [
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
      "Don't forget to include the `loop` keyword right before the opening curly brace (`{`).",
      "You don't need a semicolon (`;`) after the closing curly brace (`}`).",
    ]
  ),
  journalScene("function_outputs"),
  levelScene(
    "data_terminals_part_one",
    [],
    [
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
      `There is an example at the bottom of the "Function Outputs" journal page that is very similar to what you need to do here.`,
    ]
  ),
  levelScene(
    "gates",
    [],
    [
      `Don't forget to include the quotation marks around the string like this: \`"lovelace"\`.`,
      `The gate will only unlock if you say the password exactly right. Capitalization and punctuation matter!`,
      `If you want a reminder about what a string is, check out the "Strings" journal page.`,
    ]
  ),
  journalScene("variables"),
  levelScene(
    "variables_intro",
    [],
    [
      `Remember: quotation marks are used for strings, but not for variable names.`,
      `For this level, you should be writing \`password\` (without the quotes) instead of \`"password"\` (with the quotes).`,
      "You don't necessarily need to collect all the fuel in order to reach the goal.",
    ]
  ),
  levelScene(
    "gate_and_terminal",
    [],
    [
      "The starting code already reads the data from the terminal and stores it in a variable called `password`. You don't need to change this part.",
      "You just need to add some code after the comment that says `// ADD YOUR CODE BELOW`.",
      `If you're still feeling stuck, try going back to the "Variables" and "Function Outputs" journal pages.`,
    ]
  ),
  levelScene(
    "gate_and_terminal_part_two",
    [],
    [
      "This is very similar to the previous level, but the positions of the data terminal and gate are different.",
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
    ]
  ),
  // Temporarily disabled for the sake of saving time during playtesting.
  // levelScene("gate_and_terminal_part_three"),
  journalScene("comparisons"),
  journalScene("if_statements"),
  levelScene(
    "astroid_strike",
    [],
    [
      "The starting code already contains almost everything you need.",
      "You just need to add some code after the comment that says `// ADD YOUR CODE BELOW`, right before the closing bracket (`}`).",
      `If you're still feeling stuck, try going back to the "If Statements" journal page.`,
    ]
  ),
  levelScene(
    "astroid_strike_part_two",
    [],
    [
      'This is very similar to the previous level, but this time there are three possible directions: `"top"`, `"middle"`, and `"bottom"`.',
      "Don't forget to use the double equals sign (`==`) when comparing two things.",
      "You don't need a semicolon (`;`) after the closing curly brace (`}`).",
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
    ]
  ),
  levelScene("partly_disabled_movement"),
  journalScene("creating_functions"),
  levelScene(
    "reimplement_turn_right",
    [],
    [
      "The starting code already contains almost everything you need.",
      "You just need to finish the body of the `new_turn_right` function. Then the rest of the code should work.",
    ]
  ),
  journalScene("arrays"),
  levelScene(
    "gate_and_terminal_array",
    [],
    [
      "The starting code already reads the data from the terminal and stores it in a variable called `array`. You just need to add some code after the comment that says `// ADD YOUR CODE BELOW`.",
      "As an example, to make the rover say the element at index `0` you could write `say(array[0]);`. What do you need to change to make it say the element at index `2` instead?",
      `The "Arrays" journal page has more information and examples.`,
    ]
  ),
  levelScene(
    "telepad_part_one",
    [],
    [
      'The starting code only works if the rover is facing up after it teleports. You need to add three more if statements to handle the other possible orientations: `"down"`, `"left"`, and `"right"`.',
      "Don't forget to use the double equals sign (`==`) when comparing two things.",
      `If you're still feeling stuck, try going back to the "If Statements" and "Function Outputs" journal pages.`,
    ]
  ),
  levelScene(
    "telepad_part_two",
    [],
    [
      "This is very similar to the previous level, but this time there are two telepads instead of just one.",
      "To account for the additional telepad, you may need to use even more if statements.",
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
    ]
  ),
  levelScene("enemies_part_one"),
  levelScene("enemies_part_two"),
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
    completed:
      scene.type === "level" &&
      levelStates[scene.level?.short_name!] &&
      levelStates[scene.level?.short_name!].completed,
    challengeCompleted:
      (scene.type === "level" &&
        levelStates[scene.level?.short_name!] &&
        levelStates[scene.level?.short_name!].challengeCompleted) ||
      false,
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
