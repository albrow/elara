import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "explain_seismic_activity"
  | "explain_sensor_direction"
  | "explain_possible_paths";
export type ChoiceIds = "which_way_is_safe" | "ack_possible_paths";

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
      `Basically, if the data terminal says "left", then you should go left. ` +
      `If it says "right", then you should go right. `,
    choiceIds: ["ack_possible_paths"],
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
    text: "Got it, thanks!",
  },
};

export const TREES: DialogTrees = {
  level_seismic_activity: {
    name: "Seismic Activity",
    startId: "explain_seismic_activity",
  },
};
