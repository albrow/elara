import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "gate_is_locked" | "explain_buttons";
export type ChoiceIds = "ask_about_locked_gate" | "ack_buttons";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  gate_is_locked: {
    text: `Hmm.. that's strange. I wonder why that gate is locked?`,
    choiceIds: ["ask_about_locked_gate"],
  },
  explain_buttons: {
    text: `Oh, looks like there's a button nearby that can unlock it! Just move G.R.O.V.E.R. next to the button and call the \`press_button\` function.`,
    choiceIds: ["ack_buttons"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ask_about_locked_gate: {
    text: "Oh no! What do I do now?",
    nextId: "explain_buttons",
  },
  ack_buttons: {
    text: "Sounds easy enough!",
  },
};

export const TREES: DialogTrees = {
  level_button_and_gate: {
    name: "Buttons",
    startId: "gate_is_locked",
  },
};
