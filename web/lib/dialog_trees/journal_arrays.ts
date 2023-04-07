import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "grover_is_repaired"
  | "remind_about_user_defined_functions"
  | "ready_to_learn_about_arrays";
export type ChoiceIds =
  | "ack_grover_repaired"
  | "ack_user_defined_functions"
  | "ack_learn_about_arrays";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  grover_is_repaired: {
    text:
      "Nice work! G.R.O.V.E.R. is repaired and ready to go. You " +
      "can use the move_forward and turn_right functions again.",
    choiceIds: ["ack_grover_repaired"],
  },
  remind_about_user_defined_functions: {
    text:
      "From now on, you can create your own functions whenever you want! " +
      "It can be a great way to reuse code and make everything more readable.",
    choiceIds: ["ack_user_defined_functions"],
  },
  ready_to_learn_about_arrays: {
    text: "The next topic for you to learn about is arrays. Are you ready?",
    choiceIds: ["ack_learn_about_arrays"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_grover_repaired: {
    text: "Phew, that's great!",
    nextId: "remind_about_user_defined_functions",
  },
  ack_user_defined_functions: {
    text: "Got it.",
    nextId: "ready_to_learn_about_arrays",
  },
  ack_learn_about_arrays: {
    text: "Bring it on!",
  },
};

export const TREES: DialogTrees = {
  journal_arrays: {
    name: "Arrays",
    startId: "grover_is_repaired",
  },
};
