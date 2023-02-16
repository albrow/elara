import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "forgot_password"
  | "explain_data_terminals_1"
  | "explain_data_terminals_2"
  | "explain_data_terminals_existing_code";
export type ChoiceIds =
  | "request_gate_solution"
  | "ack_data_terminals"
  | "ack_data_terminals_existing_code";

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
    text: `Oh! I think you can retrieve the password from the nearby data terminal using the read_data function.`,
    choiceIds: ["ack_data_terminals"],
  },
  explain_data_terminals_existing_code: {
    text:
      `To help you get started I already wrote some code for you that reads the data and stores ` +
      `it in a variable called the_password. All you need to do is use that variable to ` +
      `unlock the gate and move to the goal.`,
    choiceIds: ["ack_data_terminals_existing_code"],
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
    text: "I see...",
    nextId: "explain_data_terminals_existing_code",
  },
  ack_data_terminals_existing_code: {
    text: "Got it. I can do that!",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_terminal: {
    name: "Fuel",
    startId: "forgot_password",
  },
};
