import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "good_job_on_first_level"
  | "explain_journal_1"
  | "explain_journal_2"
  | "explain_where_to_find_journal";
export type ChoiceIds =
  | "ack_good_job_on_first_level"
  | "ask_where_to_find_journal"
  | "ack_journal";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  good_job_on_first_level: {
    text: "Отличная работа! Похоже, ты понимаешь основы развёртывания и запуска кода.",
    choiceIds: ["ack_good_job_on_first_level"],
  },
  explain_journal_1: {
    text: "Прежде чем продолжить, ты должен взглянуть на Учебный журнал Ganymede Robotics. Журнал поможет изучить важные концепции с помощью видео и интерактивных примеров.",
    nextId: "explain_journal_2",
    choiceIds: [],
  },
  explain_journal_2: {
    text: "Сначала будет легко, но по мере продвижения станет сложнее, так что обязательно читай журнал и внимательно смотри видео!",
    choiceIds: ["ask_where_to_find_journal"],
  },
  explain_where_to_find_journal: {
    text: "Ты должен увидеть его прямо рядом с компьютером.",
    choiceIds: ["ack_journal"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_good_job_on_first_level: {
    text: "Спасибо!",
    nextId: "explain_journal_1",
  },
  ask_where_to_find_journal: {
    text: "Где найти журнал?",
    nextId: "explain_where_to_find_journal",
  },
  ack_journal: {
    text: "Понял!",
  },
};

export const TREES: DialogTrees = {
  explain_journal: {
    name: "Как работает журнал",
    startId: "good_job_on_first_level",
  },
};
