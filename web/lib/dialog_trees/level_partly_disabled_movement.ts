import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "grover_is_damaged"
  | "reassure_grover_is_okay"
  | "clarify_grover_damage_1"
  | "clarify_grover_damage_2"
  | "movement_impaired_until_repairs";
export type ChoiceIds =
  | "ask_if_grover_okay"
  | "ask_grover_damage_details"
  | "ack_grover_damage"
  | "ack_movement_impaired";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  grover_is_damaged: {
    text: "О нет! Похоже, Г.Р.О.В.Е.Р. получил повреждения от незамеченного астероида!",
    choiceIds: ["ask_if_grover_okay", "ask_grover_damage_details"],
  },
  reassure_grover_is_okay: {
    text: `Не волнуйся, Г.Р.О.В.Е.Р. крепче, чем кажется! Он будет в порядке, как только мы доставим его в ремонтный отсек.`,
    choiceIds: ["ask_grover_damage_details"],
  },
  clarify_grover_damage_1: {
    text: "Подожди, я запускаю полную диагностику...",
    choiceIds: [],
    nextId: "clarify_grover_damage_2",
  },
  clarify_grover_damage_2: {
    text: "Повреждения в основном затронули систему движения и навигации.",
    choiceIds: ["ack_grover_damage"],
  },
  movement_impaired_until_repairs: {
    text:
      "Пока Г.Р.О.В.Е.Р. не сможет двигаться вперёд или поворачивать направо. Будет " +
      "непросто добраться туда, но я помогу тебе довести его до ремонтного отсека, чтобы мы могли это исправить.",
    choiceIds: ["ack_movement_impaired"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ask_if_grover_okay: {
    text: "С ним всё будет в порядке?",
    nextId: "reassure_grover_is_okay",
  },
  ask_grover_damage_details: {
    text: "Какие повреждения?",
    nextId: "clarify_grover_damage_1",
  },
  ack_grover_damage: {
    text: "Что именно это означает?",
    nextId: "movement_impaired_until_repairs",
  },
  ack_movement_impaired: {
    text: "Хорошо, давай сделаем это!",
  },
};

export const TREES: DialogTrees = {
  level_partly_disabled_movement: {
    name: "Г.Р.О.В.Е.Р. повреждён",
    startId: "grover_is_damaged",
  },
};
