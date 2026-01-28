import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "greta_ahead"
  | "explain_greta"
  | "sneak_past_greta"
  | "greta_telepad_plan_1"
  | "greta_telepad_plan_2"
  | "greta_telepad_plan_3"
  | "final_encouragement"
  | "cant_finish_for_you_1"
  | "cant_finish_for_you_2"
  | "final_encouragement_again";
export type ChoiceIds =
  | "ack_greta"
  | "greta_already_sees_grover"
  | "ack_telepad_plan"
  | "express_final_doubt"
  | "ask_kalina_to_finish"
  | "ack_final_encouragement";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  greta_ahead: {
    text: "Ой-ой! Похоже, впереди большие неприятности!",
    choiceIds: [],
    nextId: "explain_greta",
  },
  explain_greta: {
    text: "Этого огромного робота зовут Г.Р.Е.Т.А. Обычно её используют для ландшафтных работ и строительных проектов, но похоже, она тоже вышла из строя!",
    choiceIds: ["ack_greta"],
  },
  sneak_past_greta: {
    text: "Тебе придётся найти способ проскользнуть мимо неё.",
    choiceIds: ["greta_already_sees_grover"],
  },
  greta_telepad_plan_1: {
    text: "Хмм...",
    choiceIds: [],
    nextId: "greta_telepad_plan_2",
  },
  greta_telepad_plan_2: {
    text: "Кажется, у меня есть половина плана... для начала можешь использовать ближайшие телепады, чтобы держать Г.Р.О.В.Е.Р.а вне её досягаемости.",
    choiceIds: [],
    nextId: "greta_telepad_plan_3",
  },
  greta_telepad_plan_3: {
    text: "Я могу помочь тебе начать с помощью удобной функции, которую я написала — `face_direction`. Я добавила комментарии, чтобы объяснить, как она работает.",
    choiceIds: ["ack_telepad_plan"],
  },
  final_encouragement: {
    text: "Не знаю. Но с учётом всего, чему ты научился, я уверена, что ты что-нибудь придумаешь! Я рассчитываю на тебя!",
    choiceIds: [
      "express_final_doubt",
      "ask_kalina_to_finish",
      "ack_final_encouragement",
    ],
  },
  cant_finish_for_you_1: {
    text: "Извини, но это невозможно. Мой компьютер практически сгорел, и я работаю на аварийном резервном питании.",
    choiceIds: [],
    nextId: "cant_finish_for_you_2",
  },
  cant_finish_for_you_2: {
    text: "Я могу помочь тебе начать, но только ты можешь написать остальной код.",
    choiceIds: [
      "express_final_doubt",
      "ask_kalina_to_finish",
      "ack_final_encouragement",
    ],
  },
  final_encouragement_again: {
    text: "Я знаю, что ты справишься! Ты прошёл долгий путь с момента нашего знакомства. Ты становишься отличным программистом!",
    choiceIds: [
      "express_final_doubt",
      "ask_kalina_to_finish",
      "ack_final_encouragement",
    ],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_greta: {
    text: "Я вижу. Что мне делать?",
    nextId: "sneak_past_greta",
  },
  greta_already_sees_grover: {
    text: "Может быть, уже поздно. Она смотрит прямо на Г.Р.О.В.Е.Р.а!",
    nextId: "greta_telepad_plan_1",
  },
  ack_telepad_plan: {
    text: "Спасибо! Это очень поможет. А какой остальной план?",
    nextId: "final_encouragement",
  },
  express_final_doubt: {
    text: "Я не уверен...",
    nextId: "final_encouragement_again",
  },
  ask_kalina_to_finish: {
    text: "Может, ты это сделаешь? У тебя больше опыта, чем у меня.",
    nextId: "cant_finish_for_you_1",
  },
  ack_final_encouragement: {
    text: "Ладно, поехали. Я справлюсь!",
  },
};

export const TREES: DialogTrees = {
  level_big_enemy: {
    name: "Большие неприятности",
    startId: "greta_ahead",
  },
};
