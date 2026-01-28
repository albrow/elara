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
    text: `Впереди ещё одни заблокированные ворота, но на этот раз я не помню пароль.`,
    choiceIds: ["request_gate_solution"],
  },
  explain_data_points_1: {
    text: `Хмм...`,
    choiceIds: [],
    nextId: "explain_data_points_2",
  },
  explain_data_points_2: {
    text: `О! Кажется, ты можешь получить пароль из ближайшей точки данных.`,
    choiceIds: ["ack_password_on_data_point"],
  },
  explain_data_points_existing_code_1: {
    text:
      `Чтобы помочь тебе начать, я уже написала код, который считывает данные и сохраняет ` +
      "их в переменную `password`.",
    choiceIds: ["ack_data_points_existing_code_1"],
  },
  explain_data_points_existing_code_2: {
    text: "Всё, что тебе нужно сделать — это использовать эту переменную, чтобы разблокировать ворота и дойти до цели.",
    choiceIds: ["ack_data_points_existing_code_2"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  request_gate_solution: {
    text: "О нет! Как мне пройти?",
    nextId: "explain_data_points_1",
  },
  ack_password_on_data_point: {
    text: "Понятно...",
    nextId: "explain_data_points_existing_code_1",
  },
  ack_data_points_existing_code_1: {
    text: "Что мне осталось сделать?",
    nextId: "explain_data_points_existing_code_2",
  },
  ack_data_points_existing_code_2: {
    text: "Понял. Я справлюсь!",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_data_point: {
    name: "Я забыл пароль",
    startId: "forgot_password",
  },
};
