import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "evil_rover_no_walls"
  | "explain_evil_rover_will_chase"
  | "explain_cause_of_malfunction"
  | "offer_explain_cause_of_malfunction"
  | "offer_explain_evil_rover_will_chase"
  | "stay_away_from_evil_rover";
export type ChoiceIds =
  | "what_is_evil_rover_doing"
  | "what_is_cause_of_malfunction"
  | "ack_evil_rover_will_chase"
  | "ack_cause_of_malfunction"
  | "no_more_evil_rover_questions"
  | "ack_stay_away_from_evil_rover";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  evil_rover_no_walls: {
    text: "Осторожно! Впереди ещё один неисправный ровер. Похоже, на этот раз нет камней, преграждающих ему путь.",
    choiceIds: ["what_is_evil_rover_doing", "what_is_cause_of_malfunction"],
  },
  explain_evil_rover_will_chase: {
    text: "Я некоторое время анализировала поведение ровера. К сожалению, похоже, он думает, что Г.Р.О.В.Е.Р. — это мусор или обломки, поэтому он попытается... утилизировать его.",
    choiceIds: ["ack_evil_rover_will_chase"],
  },
  explain_cause_of_malfunction: {
    text: "Я пока не уверена. Это может быть солнечная вспышка или, возможно, баг в программе. Я продолжу расследование.",
    choiceIds: ["ack_cause_of_malfunction"],
  },
  offer_explain_cause_of_malfunction: {
    text: "Хочешь ещё что-нибудь узнать о неисправных роверах?",
    choiceIds: ["what_is_cause_of_malfunction", "no_more_evil_rover_questions"],
  },
  offer_explain_evil_rover_will_chase: {
    text: "Хочешь ещё что-нибудь узнать о неисправных роверах?",
    choiceIds: ["what_is_evil_rover_doing", "no_more_evil_rover_questions"],
  },
  stay_away_from_evil_rover: {
    text: "Просто держись от него подальше, и всё будет в порядке.",
    choiceIds: ["ack_stay_away_from_evil_rover"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  what_is_evil_rover_doing: {
    text: "Что он делает?",
    nextId: "explain_evil_rover_will_chase",
  },
  ack_evil_rover_will_chase: {
    text: "О нет! Постараюсь не допустить этого.",
    nextId: "offer_explain_cause_of_malfunction",
  },
  what_is_cause_of_malfunction: {
    text: "Почему эти роверы неисправны?",
    nextId: "explain_cause_of_malfunction",
  },
  ack_cause_of_malfunction: {
    text: "Понятно. Надеюсь, ты скоро разберёшься.",
    nextId: "offer_explain_evil_rover_will_chase",
  },
  no_more_evil_rover_questions: {
    text: "Нет, пока мне достаточно.",
    nextId: "stay_away_from_evil_rover",
  },
  ack_stay_away_from_evil_rover: {
    text: "Хорошо, постараюсь!",
  },
};

export const TREES: DialogTrees = {
  level_enemies_part_one: {
    name: "Обнаружена неисправность",
    startId: "evil_rover_no_walls",
  },
};
