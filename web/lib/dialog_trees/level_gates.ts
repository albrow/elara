import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "explain_password_gates" | "provide_password";
export type ChoiceIds = "request_password" | "ack_password";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_password_gates: {
    text:
      `Looks like a password gate is blocking the way! Instead of a button, this ` +
      `kind of gate can be opened or closed by saying the password. First move ` +
      "G.R.O.V.E.R. next to the gate, then say the password using the `say` function.",
    choiceIds: ["request_password"],
  },
  provide_password: {
    text: `You're in luck! I remember the password for this gate. It's \`"lovelace"\`.`,
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
    name: "Password Gates",
    startId: "explain_password_gates",
  },
};
