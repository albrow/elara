import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "explain_gates" | "provide_password";
export type ChoiceIds = "request_password" | "ack_password";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_gates: {
    text:
      `Looks like a locked gate is blocking the way! To open the gate, ` +
      `move G.R.O.V.E.R. next to it, then say the password using the "say" function.`,
    choiceIds: ["request_password"],
  },
  provide_password: {
    text: `You're in luck! I remember the password for this gate. It's "lovelace".`,
    choiceIds: ["ack_password"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  request_password: {
    text: "How do I figure out the password?",
    nextId: "provide_password",
  },
  ack_password: {
    text: "Got it, thanks!",
  },
};

export const TREES: DialogTrees = {
  level_gates: {
    name: "Gates",
    startId: "explain_gates",
  },
};
