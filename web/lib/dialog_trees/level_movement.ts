import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "level_movement_start"
  | "explain_code_editor"
  | "explain_board"
  | "explain_objective"
  | "explain_control_bar"
  | "explanation_end";
export type ChoiceIds =
  | "level_movement_end"
  | "level_movement_end_early"
  | "level_movement_end_late"
  | "request_explain_ui"
  | "request_explain_ui_again"
  | "ack_code_editor"
  | "ack_board"
  | "ack_objective"
  | "ack_control_bar";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  level_movement_start: {
    text: `Do you want to learn the basics of how to write and run your code?`,
    choiceIds: ["request_explain_ui", "level_movement_end_early"],
  },
  explain_code_editor: {
    text: `The code editor is on the left side of your screen. When you are ready to run your code, press the "Run" button.`,
    choiceIds: ["ack_code_editor", "level_movement_end"],
  },
  explain_board: {
    text: "On the right side of your screen is a live video feed. You should see G.R.O.V.E.R. there now. When you run your code, G.R.O.V.E.R will move around and perform various actions.",
    choiceIds: ["ack_board", "level_movement_end"],
  },
  explain_objective: {
    text: "Near the top of your screen, you'll see the current objective. Usually you need to move G.R.O.V.E.R. to a certain location, but sometimes you need to do something else.",
    choiceIds: ["ack_objective", "level_movement_end"],
  },
  explain_control_bar: {
    text: `After pressing the "Run" button, you can pause, step forward, or step backward through the code. If you ever get confused about what your code is doing, pausing and going one step at a time can be a great way to wrap your head around it!`,
    choiceIds: ["ack_control_bar", "level_movement_end"],
  },
  explanation_end: {
    text: `Great! That's all you need to know for now. Any other questions?`,
    choiceIds: ["level_movement_end_late", "request_explain_ui_again"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  level_movement_end_early: {
    text: "No thanks! I know what I'm doing.",
  },
  level_movement_end: {
    text: "Thanks! I think I can figure it out from here.",
  },
  request_explain_ui: {
    text: "Sure, I could use a refresher.",
    nextId: "explain_code_editor",
  },
  ack_code_editor: {
    text: "Got it. What else?",
    nextId: "explain_board",
  },
  ack_board: {
    text: "Okay. What's next?",
    nextId: "explain_objective",
  },
  ack_objective: {
    text: "Okay.",
    nextId: "explain_control_bar",
  },
  ack_control_bar: {
    text: "Got it.",
    nextId: "explanation_end",
  },
  request_explain_ui_again: {
    text: "Could you explain all that again?",
    nextId: "explain_code_editor",
  },
  level_movement_end_late: {
    text: "Nope, I think I get it.",
  },
};

export const TREES: DialogTrees = {
  level_movement: {
    name: "Movement",
    startId: "level_movement_start",
  },
};
