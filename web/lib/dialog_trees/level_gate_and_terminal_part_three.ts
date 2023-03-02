import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "explain_multi_terminals";
export type ChoiceIds = "ack_multi_terminals";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_multi_terminals: {
    text:
      "Hmm... this time there are multiple data terminals. I know one of them " +
      "holds the password, but I'm not sure which one.",
    choiceIds: ["ack_multi_terminals"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_multi_terminals: {
    text: "No problem! I'll just try them one at a time.",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_terminal_part_three: {
    name: "Multiple Data Terminals",
    startId: "explain_multi_terminals",
  },
};
