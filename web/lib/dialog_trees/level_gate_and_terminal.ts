import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "forgot_password"
  | "explain_data_terminals_1"
  | "explain_data_terminals_2"
  | "explain_data_terminals_3";
export type ChoiceIds = "request_gate_solution" | "ack_data_terminals";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  forgot_password: {
    text: `There's another locked gate ahead, but this time I don't remember the password.`,
    choiceIds: ["request_gate_solution"],
  },
  explain_data_terminals_1: {
    text: `Hmm...`,
    choiceIds: [],
    nextId: "explain_data_terminals_2",
  },
  explain_data_terminals_2: {
    text: `Oh! I think you can retrieve the password from the nearby data terminal.`,
    choiceIds: [],
    nextId: "explain_data_terminals_3",
  },
  explain_data_terminals_3: {
    text: `To read from a data terminal, move the rover next to it and use the "read_data" function.`,
    choiceIds: ["ack_data_terminals"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  request_gate_solution: {
    text: "Oh no! How can I get through?",
    nextId: "explain_data_terminals_1",
  },
  ack_data_terminals: {
    text: "Cool, I think I can do that.",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_terminal: {
    name: "Fuel",
    startId: "forgot_password",
  },
};
