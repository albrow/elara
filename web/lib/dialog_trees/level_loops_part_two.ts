import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "mention_something_evil_rover"
  | "elaborate_evil_rover"
  | "reassure_about_evil_rover";
export type ChoiceIds =
  | "ask_about_something_evil_rover"
  | "ack_reassure_about_evil_rover";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  mention_something_evil_rover: {
    text: "Hmm... that's weird.",
    choiceIds: ["ask_about_something_evil_rover"],
  },
  elaborate_evil_rover: {
    text: "Well.. there's another rover nearby but it's not responding to my commands. I can see it moving around, but I'm not sure what its trying to do.",
    choiceIds: [],
    nextId: "reassure_about_evil_rover",
  },
  reassure_about_evil_rover: {
    text: "Probably just a temporary glitch. I'm sure it'll be fine. In the meantime, if you see a malfunctioning rover, just stay away from it.",
    choiceIds: ["ack_reassure_about_evil_rover"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ask_about_something_evil_rover: {
    text: "What is it?",
    nextId: "elaborate_evil_rover",
  },
  ack_reassure_about_evil_rover: {
    text: "I'll keep an eye out.",
  },
};

export const TREES: DialogTrees = {
  level_loops_part_two: {
    name: "All By Yourself",
    startId: "mention_something_evil_rover",
  },
};
