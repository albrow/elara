import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "explain_multi_data_points";
export type ChoiceIds = "ack_multi_data_points";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_multi_data_points: {
    text:
      "Hmm... this time there are multiple data points. I know one of them " +
      "holds the password, but I'm not sure which one.",
    choiceIds: ["ack_multi_data_points"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_multi_data_points: {
    text: "No problem! I'll just try them one at a time.",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_data_point_part_three: {
    name: "Multiple Data Points",
    startId: "explain_multi_data_points",
  },
};
