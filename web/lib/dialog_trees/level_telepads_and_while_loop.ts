import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "lot_of_telepads"
  | "idea_for_telepads"
  | "telepad_while_loop_idea"
  | "elaborate_while_loop_idea"
  | "explain_face_up_func"
  | "explain_face_up_func_2";
export type ChoiceIds =
  | "ack_lot_of_telepads"
  | "ack_while_loop_idea"
  | "ask_about_while_loops"
  | "ack_face_up_func";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  lot_of_telepads: {
    text: `Wow that's a lot of telepads!`,
    choiceIds: ["ack_lot_of_telepads"],
  },
  idea_for_telepads: {
    text: "I've got an idea!",
    choiceIds: [],
    nextId: "telepad_while_loop_idea",
  },
  telepad_while_loop_idea: {
    text: `Instead of using a lot of if statements to handle each possible direction that G.R.O.V.E.R. might be facing, you could use a while loop.`,
    choiceIds: ["ack_while_loop_idea", "ask_about_while_loops"],
  },
  elaborate_while_loop_idea: {
    text: `While loops can be used to run code repeatedly until a certain condition is met. In our case, we'll use this to make G.R.O.V.E.R. keep turning until he is facing up, no matter which direction he was facing at the start.`,
    choiceIds: ["ack_while_loop_idea"],
  },
  explain_face_up_func: {
    text: "I'll get the code started for you by creating a new function called `face_up` which uses the while loop idea.",
    choiceIds: [],
    nextId: "explain_face_up_func_2",
  },
  explain_face_up_func_2: {
    text: "Then you can use the `face_up` function in your code. It should make these telepads a lot easier to deal with!",
    choiceIds: ["ack_face_up_func"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_lot_of_telepads: {
    text: `Tell me about it...`,
    nextId: "idea_for_telepads",
  },
  ack_while_loop_idea: {
    text: `I see! That's pretty clever.`,
    nextId: "explain_face_up_func",
  },
  ask_about_while_loops: {
    text: `I don't get it. What do you mean?`,
    nextId: "elaborate_while_loop_idea",
  },
  ack_face_up_func: {
    text: `Awesome, thanks!`,
  },
};

export const TREES: DialogTrees = {
  level_telepads_and_while_loop: {
    name: "Telepads and While Loops",
    startId: "lot_of_telepads",
  },
};
