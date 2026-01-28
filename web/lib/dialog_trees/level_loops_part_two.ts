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
    text: "Хм... это странно.",
    choiceIds: ["ask_about_something_evil_rover"],
  },
  elaborate_evil_rover: {
    text: "Ну... рядом есть ещё один ровер, но он не отвечает на мои команды. Я вижу, как он движется, но не понимаю, что он пытается делать.",
    choiceIds: [],
    nextId: "reassure_about_evil_rover",
  },
  reassure_about_evil_rover: {
    text: "Наверное, просто временный сбой. Уверена, всё будет в порядке. А пока, если увидишь неисправного ровера, просто держись от него подальше.",
    choiceIds: ["ack_reassure_about_evil_rover"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ask_about_something_evil_rover: {
    text: "Что такое?",
    nextId: "elaborate_evil_rover",
  },
  ack_reassure_about_evil_rover: {
    text: "Буду начеку.",
  },
};

export const TREES: DialogTrees = {
  level_loops_part_two: {
    name: "Самостоятельно",
    startId: "mention_something_evil_rover",
  },
};
