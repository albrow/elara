import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "explain_seismic_activity"
  | "explain_sensor_direction"
  | "explain_possible_paths"
  | "explain_seismic_activity_existing_code_1"
  | "explain_seismic_activity_existing_code_2";
export type ChoiceIds =
  | "which_way_is_safe"
  | "ack_possible_paths"
  | "ack_seismic_activity_existing_code";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_seismic_activity: {
    text:
      `Be careful! I'm detecting some seismic activity ahead. ` +
      `You'll need to choose a path that avoids the falling rocks.`,
    choiceIds: ["which_way_is_safe"],
  },
  explain_sensor_direction: {
    text:
      `There's a data terminal ahead which is connected to a moonquake sensor. ` +
      `It can tell you which way is safe to go.`,
    choiceIds: [],
    nextId: "explain_possible_paths",
  },
  explain_possible_paths: {
    text:
      `The safe direction is random and can change every time, so you need to ` +
      `handle *both* cases. Basically, if the data terminal says "left", then you ` +
      `should go left. If it says "right", then you should go right.`,
    choiceIds: ["ack_possible_paths"],
  },
  explain_seismic_activity_existing_code_1: {
    text:
      `I've already written some code for you that reads the data ` +
      `and stores it in a variable called safe_direction.`,
    choiceIds: [],
    nextId: "explain_seismic_activity_existing_code_2",
  },
  explain_seismic_activity_existing_code_2: {
    text:
      `I also started the if statement for you. If safe_direction is "left", then G.R.O.V.E.R ` +
      `will go left. You just need to add some code to handle the case when safe_direction is "right".`,
    choiceIds: ["ack_seismic_activity_existing_code"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  which_way_is_safe: {
    text: "How do I know which way is safe?",
    nextId: "explain_sensor_direction",
  },
  ack_possible_paths: {
    text: "Okay. That doesn't sound too hard.",
    nextId: "explain_seismic_activity_existing_code_1",
  },
  ack_seismic_activity_existing_code: {
    text: "Got it. Let's do this!",
  },
};

export const TREES: DialogTrees = {
  level_seismic_activity: {
    name: "Seismic Activity",
    startId: "explain_seismic_activity",
  },
};
