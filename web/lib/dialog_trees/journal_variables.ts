import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "variables_take_time" | "how_to_backtrack";
export type ChoiceIds = "ack_variables_take_time";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  variables_take_time: {
    text:
      "Heads up! This is a concept that a lot of new recruits struggle with. " +
      "Take your time, read carefully, and play around with the code examples " +
      "to get a feel for how variables work. You can do it!",
    choiceIds: [],
    nextId: "how_to_backtrack",
  },
  how_to_backtrack: {
    text:
      'If you need to, you can always come back to this page later by pressing the "Scenes" ' +
      "button near the top of the screen.",
    choiceIds: ["ack_variables_take_time"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_variables_take_time: {
    text: "Thanks!",
  },
};

export const TREES: DialogTrees = {
  journal_variables: {
    name: "Variables",
    startId: "variables_take_time",
  },
};
