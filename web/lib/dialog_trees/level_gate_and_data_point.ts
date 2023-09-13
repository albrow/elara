import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "forgot_password"
  | "explain_data_points_1"
  | "explain_data_points_2"
  | "explain_data_points_existing_code_1"
  | "explain_data_points_existing_code_2";
export type ChoiceIds =
  | "request_gate_solution"
  | "ack_password_on_data_point"
  | "ack_data_points_existing_code_1"
  | "ack_data_points_existing_code_2";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  forgot_password: {
    text: `There's another locked gate ahead, but this time I don't remember the password.`,
    choiceIds: ["request_gate_solution"],
  },
  explain_data_points_1: {
    text: `Hmm...`,
    choiceIds: [],
    nextId: "explain_data_points_2",
  },
  explain_data_points_2: {
    text: `Oh! I think you can retrieve the password from the nearby data point.`,
    choiceIds: ["ack_password_on_data_point"],
  },
  explain_data_points_existing_code_1: {
    text:
      `To help you get started I already wrote some code for you that reads the data and stores ` +
      "it in a variable called `password`.",
    choiceIds: ["ack_data_points_existing_code_1"],
  },
  explain_data_points_existing_code_2: {
    text: "All you need to do is use that variable to unlock the gate and move to the goal.",
    choiceIds: ["ack_data_points_existing_code_2"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  request_gate_solution: {
    text: "Oh no! How can I get through?",
    nextId: "explain_data_points_1",
  },
  ack_password_on_data_point: {
    text: "I see...",
    nextId: "explain_data_points_existing_code_1",
  },
  ack_data_points_existing_code_1: {
    text: "What's left for me to do?",
    nextId: "explain_data_points_existing_code_2",
  },
  ack_data_points_existing_code_2: {
    text: "Got it. I can do that!",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_data_point: {
    name: "I Forgot the Password",
    startId: "forgot_password",
  },
};
