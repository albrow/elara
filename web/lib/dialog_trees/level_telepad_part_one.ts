import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "explain_telepads"
  | "explain_telepads_2"
  | "explain_telepads_catch"
  | "explain_telepads_code"
  | "explain_telepads_code_2";
export type ChoiceIds =
  | "ask_telepad_catch"
  | "ack_telepads_catch"
  | "ack_telepads_code";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_telepads: {
    text: `One of the things we're researching here at Moonbase Beta is teleportation technology.`,
    choiceIds: [],
    nextId: "explain_telepads_2",
  },
  explain_telepads_2: {
    text:
      `We created a device called a "telepad" that can teleport relatively small ` +
      `objects across short distances. But... there's a catch!`,
    choiceIds: ["ask_telepad_catch"],
  },
  explain_telepads_catch: {
    text:
      `Objects that are teleported often get flipped around unpredictably. So if you enter ` +
      `the telepad facing one direction, you can end up facing a completely different ` +
      `direction on the other side!`,
    choiceIds: ["ack_telepads_catch"],
  },
  explain_telepads_code: {
    text:
      "In order to deal with this side-effect, you'll need to use the `get_orientation` function " +
      `to figure out which way G.R.O.V.E.R. is facing after teleporting. Then use an if statement ` +
      `to handle each possible orientation.`,
    choiceIds: [],
    nextId: "explain_telepads_code_2",
  },
  explain_telepads_code_2: {
    text:
      `I already got the code started for you. Do you think you can finish it by adding more ` +
      `if statements?`,
    choiceIds: ["ack_telepads_code"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ask_telepad_catch: {
    text: "What's the catch?",
    nextId: "explain_telepads_catch",
  },
  ack_telepads_catch: {
    text: "Whoa... that's weird.",
    nextId: "explain_telepads_code",
  },
  ack_telepads_code: {
    text: "Only one way to find out!",
  },
};

export const TREES: DialogTrees = {
  level_telepad_part_one: {
    name: "Unintended Effects",
    startId: "explain_telepads",
  },
};
