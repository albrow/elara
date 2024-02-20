import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "grover_is_damaged"
  | "reassure_grover_is_okay"
  | "clarify_grover_damage_1"
  | "clarify_grover_damage_2"
  | "movement_impaired_until_repairs";
export type ChoiceIds =
  | "ask_if_grover_okay"
  | "ask_grover_damage_details"
  | "ack_grover_damage"
  | "ack_movement_impaired";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  grover_is_damaged: {
    text: "Oh no! It looks like G.R.O.V.E.R has sustained some damage from an undetected asteroid!",
    choiceIds: ["ask_if_grover_okay", "ask_grover_damage_details"],
  },
  reassure_grover_is_okay: {
    text: `Don't worry, G.R.O.V.E.R. is tougher than he looks! He'll be fine as soon as we can get him to the repair bay.`,
    choiceIds: ["ask_grover_damage_details"],
  },
  clarify_grover_damage_1: {
    text: "Hang on, I'm running a full diagnostic...",
    choiceIds: [],
    nextId: "clarify_grover_damage_2",
  },
  clarify_grover_damage_2: {
    text: "The damage is mostly to the movement and navigation system.",
    choiceIds: ["ack_grover_damage"],
  },
  movement_impaired_until_repairs: {
    text:
      "For now, G.R.O.V.E.R. will be unable to move forward or turn right. It's going " +
      "to be challenging to get there, but I'll help you navigate him to the repair bay so we can fix this.",
    choiceIds: ["ack_movement_impaired"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ask_if_grover_okay: {
    text: "Is he going to be okay?",
    nextId: "reassure_grover_is_okay",
  },
  ask_grover_damage_details: {
    text: "What kind of damage?",
    nextId: "clarify_grover_damage_1",
  },
  ack_grover_damage: {
    text: "What does that mean exactly?",
    nextId: "movement_impaired_until_repairs",
  },
  ack_movement_impaired: {
    text: "Okay, let's do this!",
  },
};

export const TREES: DialogTrees = {
  level_partly_disabled_movement: {
    name: "G.R.O.V.E.R. is damaged",
    startId: "grover_is_damaged",
  },
};
