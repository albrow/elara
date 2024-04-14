/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { titleCase } from "title-case";

import {
  // eslint-disable-next-line camelcase
  get_level_data,
  LevelData,
} from "../../elara-lib/pkg/elara_lib";
import { SectionName } from "../components/journal/sections";
import type { LevelState } from "../contexts/save_data";
import { ShortId } from "./tutorial_shorts";
import { TREES } from "./dialog_trees";

export type SceneType = "level" | "dialog" | "journal" | "cutscene";

interface RawScene {
  type: SceneType;
  name: string;
  routeName: string;
  routeParams?: Record<string, any>;
  level?: LevelData; // Undefined for non-level scenes.
  cutsceneId?: string; // Undefined for non-cutscene scenes.
  tutorialShorts?: ShortId[];
  hints?: string[];
  // A sound effect to be played immediately after navigating to this scene.
  // Used as a workaround for iOS audio restrictions, namely that audio can
  // only be played in direct response to user action (i.e. in a click handler).
  initialSound?: string;
  // New functions that should be unlocked when navigating to this scene.
  newFunctions?: string[];
}

export interface Scene extends RawScene {
  unlocked: boolean;
  completed: boolean;
  challengeCompleted: boolean;
  index: number;
  levelIndex?: number;
  nextScene?: Scene;
  prevScene?: Scene;
  // Music that should be played for this scene (if any).
  music?: string;
}

const levelData: Map<string, LevelData> = new Map(
  Object.entries(get_level_data() as any)
);

const musicMap: Record<string, string> = {
  movement: "gettingOffTheGround",
  movement_part_two: "gettingOffTheGround",
  energy_part_one: "gettingOffTheGround",
  loops_part_one: "gettingOffTheGround",
  loops_part_two: "gettingOffTheGround",
  buttons_part_one: "gettingOffTheGround",
  button_and_gate: "gettingOffTheGround",
  button_and_gate_part_two: "gettingOffTheGround",
  crates_part_one: "gettingOffTheGround",
  crates_part_two: "gettingOffTheGround",
  data_points_part_one: "driftingIntoSpace",
  gates: "driftingIntoSpace",
  variables_intro: "driftingIntoSpace",
  gate_and_data_point: "driftingIntoSpace",
  gate_and_data_point_part_two: "driftingIntoSpace",
  asteroid_strike: "driftingIntoSpace",
  asteroid_strike_part_two: "driftingIntoSpace",
  partly_disabled_movement: "lookingAhead",
  reimplement_turn_right: "lookingAhead",
  telepad_part_one: "lookingAhead",
  telepad_part_two: "lookingAhead",
  telepads_and_while_loop: "lookingAhead",
  telepad_and_button_gate: "lookingAhead",
  enemies_part_one: "measuringTheChallenge",
  enemies_part_two: "measuringTheChallenge",
  enemies_with_telepad: "measuringTheChallenge",
  enemies_and_asteroids: "measuringTheChallenge",
  big_enemy: "puttingItAllTogether",
  server_room: "notTheEnd",
};

// Special levels used for runnable examples.
export const SANDBOX_LEVEL = levelData.get("sandbox")!;
export const SANDBOX_WITH_DATA_POINT_LEVEL = levelData.get(
  "sandbox_with_data_point"
)!;

function levelScene(
  shortName: string,
  tutorialShorts?: ShortId[],
  hints?: string[],
  newFunctions?: string[]
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
    newFunctions,
  };
}

function dialogScene(treeName: keyof typeof TREES): RawScene {
  const { startId } = TREES[treeName];
  return {
    type: "dialog",
    name: `${TREES[treeName].name}`,
    routeName: "dialog",
    routeParams: { treeName },
    initialSound: `dialog_${startId}`,
  };
}

function journalScene(sectionName: string, newFunctions?: string[]): RawScene {
  return {
    type: "journal",
    name: titleCase(sectionName.split("_").join(" ")),
    routeName: "journal_section",
    routeParams: { sectionName },
    newFunctions,
  };
}

function cutsceneScene(cutsceneId: string): RawScene {
  return {
    type: "cutscene",
    name: titleCase(cutsceneId.split("_").join(" ")),
    routeName: "cutscene",
    routeParams: { cutsceneId },
    cutsceneId,
  };
}

const RAW_SCENES: RawScene[] = [
  dialogScene("intro"),
  levelScene(
    "movement",
    ["how_to_run_code", "where_to_find_objectives", "how_to_see_errors"],
    [
      "Find the line of code that says `move_forward(1);`. Try changing the number `1` to a different number.",
      "The `turn_right` function doesn't expect any inputs, so you don't need to put anything in between the parentheses. (You'll learn more about function inputs soon.)",
    ]
  ),
  journalScene("functions", ["say"]),
  journalScene("comments"),
  levelScene(
    "movement_part_two",
    ["back_to_hub", "how_to_view_function_list", "extra_challenges"],
    [
      "Use the `move_forward` and `turn_left` functions to move the rover to the goal.",
      "Don't forget to put a semicolon (`;`) at the end of each function call.",
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
    ]
  ),
  levelScene("energy_part_one", [
    "moving_takes_energy",
    "how_to_get_more_energy",
  ]),
  journalScene("strings"),
  journalScene("loops"),
  levelScene(
    "loops_part_one",
    ["show_hints_and_dialog", "how_to_pause_and_step"],
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
  levelScene(
    "button_and_gate",
    ["hover_over_text", "hover_over_board"],
    [
      "Remember, the `press_button` function only works if G.R.O.V.E.R. is next to the button (he doesn't need to be facing it).",
    ],
    ["press_button"]
  ),
  levelScene(
    "button_and_gate_part_two",
    [],
    [
      "Remember, the `press_button` function only works if G.R.O.V.E.R. is next to the button (he doesn't need to be facing it).",
      "You'll need to unlock one gate first, then the other.",
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
    ]
  ),
  levelScene(
    "crates_part_one",
    [],
    [
      "G.R.O.V.E.R. needs to be facing a crate in order to pick it up.",
      "G.R.O.V.E.R. needs to be facing an empty space in order to drop a crate.",
    ],
    ["pick_up", "drop"]
  ),
  levelScene(
    "crates_part_two",
    [],
    [
      "G.R.O.V.E.R. needs to be facing a crate in order to pick it up.",
      "G.R.O.V.E.R. needs to be facing an empty space in order to drop a crate.",
      "G.R.O.V.E.R. can only carry one crate at a time. You'll need to drop the first one in order to pick up the second.",
    ]
  ),
  journalScene("function_outputs", ["get_orientation", "read_data"]),
  levelScene(
    "data_points_part_one",
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
      "You don't necessarily need to collect all the energy cells in order to reach the goal.",
    ]
  ),
  levelScene(
    "gate_and_data_point",
    [],
    [
      "The starting code already reads the data from the data point and stores it in a variable called `password`. You don't need to change this part.",
      "You just need to add some code after the comment that says `// ADD YOUR CODE BELOW`.",
      `If you're still feeling stuck, try going back to the "Variables" and "Function Outputs" journal pages.`,
    ]
  ),
  levelScene(
    "gate_and_data_point_part_two",
    [],
    [
      "This is very similar to the previous level, but the positions of the data point and gate are different.",
      "Remember: G.R.O.V.E.R. needs to be next to the data point before you call `read_data`.",
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
    ]
  ),
  // Temporarily disabled for the sake of saving time during playtesting.
  // levelScene("gate_and_data_point_part_three"),
  journalScene("comparisons"),
  journalScene("if_statements"),
  levelScene(
    "asteroid_strike",
    [],
    [
      "The starting code already contains almost everything you need.",
      "You just need to add some code after the comment that says `// ADD YOUR CODE BELOW`, right before the closing bracket (`}`).",
      `If you're still feeling stuck, try going back to the "If Statements" journal page.`,
    ]
  ),
  levelScene(
    "asteroid_strike_part_two",
    [],
    [
      'This is very similar to the previous level, but this time there are three possible directions: `"top"`, `"middle"`, and `"bottom"`.',
      "Don't forget to use the double equals sign (`==`) when comparing two things.",
      "You don't need a semicolon (`;`) after the closing curly brace (`}`).",
      "Feel free to copy & paste pieces of code from previous levels or journal pages.",
    ]
  ),
  cutsceneScene("grover_damaged"),
  levelScene("partly_disabled_movement"),
  journalScene("creating_functions"),
  levelScene(
    "reimplement_turn_right",
    [],
    [
      "The starting code already contains almost everything you need.",
      "You just need to finish the body of the `three_lefts` function. Then the rest of the code should work.",
    ]
  ),
  cutsceneScene("grover_repaired"),
  // Temporarily disable arrays because the concept is not super fleshed out yet.
  // May decide to re-enable later.
  //
  // journalScene("arrays"),
  // levelScene(
  //   "gate_and_data_point_array",
  //   [],
  //   [
  //     "The starting code already reads the data from the data point and stores it in a variable called `array`. You just need to add some code after the comment that says `// ADD YOUR CODE BELOW`.",
  //     "As an example, to make the rover say the element at index `0` you could write `say(array[0]);`. What do you need to change to make it say the element at index `2` instead?",
  //     `The "Arrays" journal page has more information and examples.`,
  //   ]
  // ),
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
  journalScene("while_loops"),
  levelScene(
    "telepads_and_while_loop",
    [],
    [
      "You only need to add a few more lines of code at the end.",
      "You don't need to write any if statements. You can just use the `face_up` function instead.",
      'If you\'re feeling lost, go back and look at the "While Loops" and "Creating Functions" journal pages.',
    ]
  ),
  levelScene(
    "telepad_and_button_gate",
    [],
    [
      "You need to press the button to unlock the gate, but how do you reach the button?",
      "Just like in the previous level, you can use a while loop together wth the `get_orientation` function to make the telepads easier to deal with.",
    ]
  ),
  levelScene(
    "enemies_part_one",
    [],
    [
      "This level doesn't require any fancy code, just the basic movement functions: `move_forward`, `turn_right`, and `turn_left`.",
      "The malfunctioning rover will chase G.R.O.V.E.R. around, but it's not very smart and can be easily outmaneuvered.",
    ]
  ),
  cutsceneScene("midgame"),
  dialogScene("kalina_in_trouble"),
  levelScene(
    "enemies_part_two",
    [],
    ["If you're not sure where to go, try moving toward the energy cell first."]
  ),
  levelScene(
    "enemies_with_telepad",
    [],
    [
      "The first thing you should do is move G.R.O.V.E.R. to the telepad entrance.",
      "Malfunctioning rovers can get stuck in corners or dead ends. Try using this to your advantage!",
      "After going through a telepad, you will need to use the `get_orientation` function to figure out which way to turn. (You can go back and look at previous levels for examples).",
    ]
  ),
  levelScene(
    "enemies_and_asteroids",
    [],
    [
      'This is similar to the level called "Asteroid Strike", so feel free to go back and look at that level for ideas.',
      "The shortest path to the goal is not necessarily the best path.",
    ]
  ),
  levelScene(
    "big_enemy",
    [],
    [
      `Try reviewing the journal pages "Function Outputs" and "Creating Functions".`,
      `You can also review the levels "Let Me In", "Forgotten Password", and "Up and Up and Up".`,
      "Don't forget- you can hover over different objects on the map to see what they do.",
      "One of the gates is currently open. What happens if you press the button to close it?",
    ]
  ),
  levelScene("server_room", [], []),
  cutsceneScene("end"),
];

const getLevelIndexFromScene = (
  allScenes: RawScene[],
  scene: RawScene
): number | undefined => {
  const levels = allScenes.filter((s) => s.type === "level");
  return levels.indexOf(scene);
};

function isSceneCompleted(
  levelStates: Record<string, LevelState>,
  seenJournalPages: SectionName[],
  seenDialogTrees: string[],
  seenCutscenes: string[],
  scene: RawScene
) {
  if (scene.type === "level") {
    const levelState = levelStates[scene.level?.short_name!];
    return levelState?.completed ?? false;
  }
  if (scene.type === "journal") {
    return seenJournalPages.includes(scene.routeParams?.sectionName!);
  }
  if (scene.type === "dialog") {
    return seenDialogTrees.includes(scene.routeParams?.treeName!);
  }
  if (scene.type === "cutscene") {
    return seenCutscenes.includes(scene.routeParams?.cutsceneId!);
  }
  throw new Error(`Unknown scene type: ${scene.type}`);
}

// Unlock each scene if the scene is completed or the previous scene is completed.
function unlockScenes(scenes: Scene[]) {
  // Start by marking all scenes as locked.
  const result = scenes.map((scene) => ({
    ...scene,
    unlocked: false,
  }));

  // First scene is always unlocked.
  result[0].unlocked = true;

  // Subsequent scenes are unlocked if all previous
  // scenes are completed.
  for (let i = 1; i < result.length; i += 1) {
    const prevScene = result[i - 1];
    const currScene = result[i];
    if (prevScene.completed) {
      currScene.unlocked = true;
    }
    if (!currScene.completed || !prevScene.completed) {
      // If the current scene is not completed, no later
      // scenes should be unlocked, so we can break out.
      break;
    }
  }
  return result;
}

function processScenes(
  levelStates: Record<string, LevelState>,
  seenJournalPages: SectionName[],
  seenDialogTrees: string[],
  seenCutscenes: string[],
  scenes: RawScene[]
): Scene[] {
  let result: Scene[] = scenes.map(
    (scene, index) =>
      ({
        ...scene,
        index,
        completed: isSceneCompleted(
          levelStates,
          seenJournalPages,
          seenDialogTrees,
          seenCutscenes,
          scene
        ),
        challengeCompleted:
          (scene.type === "level" &&
            levelStates[scene.level?.short_name!] &&
            levelStates[scene.level?.short_name!].challengeCompleted) ||
          false,
        levelIndex: getLevelIndexFromScene(scenes, scene),
        unlocked: false, // Will be automatically set later.
        music: musicMap[scene.level?.short_name!] ?? undefined,
      } as Scene)
  );

  result = unlockScenes(result);

  // eslint-disable-next-line no-restricted-syntax
  for (const s of result) {
    if (s.index < result.length - 1) {
      s.nextScene = result[s.index + 1];
    }
    if (s.index > 0) {
      s.prevScene = result[s.index - 1];
    }
  }

  return result;
}

/**
 * Processes and returns scenes based on the given save data information.
 * "Processing" in this context means marking the scenes as unlocked, completed,
 * etc. This typically should not be used directly, but rather through the
 * `useScenes` hook.
 *
 * In some rare cases, it may be necessary to use this function directly. For
 * example, certain hooks need to use the bleeding-edge latest save data, which
 * is not normally available.
 *
 * @param levelStates saveData.levelStates
 * @param seenJournalPages saveData.seenJournalPages
 * @param seenDialogTrees saveData.seenDialogTrees
 * @param seenCutscenes saveData.seenCutscenes
 * @returns the processed scenes
 */
export function getProcessedScenes(
  levelStates: Record<string, LevelState>,
  seenJournalPages: SectionName[],
  seenDialogTrees: string[],
  seenCutscenes: string[]
): Scene[] {
  return processScenes(
    levelStates,
    seenJournalPages,
    seenDialogTrees,
    seenCutscenes,
    RAW_SCENES
  );
}
