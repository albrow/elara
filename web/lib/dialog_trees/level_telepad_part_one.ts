import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "explain_grover_is_repaired"
  | "explain_telepads"
  | "explain_telepads_2"
  | "explain_telepads_catch"
  | "explain_telepads_code"
  | "explain_telepads_code_2";
export type ChoiceIds =
  | "ack_grover_is_repaired"
  | "ask_telepad_catch"
  | "ack_telepads_catch"
  | "ack_telepads_code";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_grover_is_repaired: {
    text: "Отличная работа! Г.Р.О.В.Е.Р. полностью починен и готов к работе. Ты снова можешь использовать функции `turn_right` и `move_forward`.",
    choiceIds: ["ack_grover_is_repaired"],
  },
  explain_telepads: {
    text: `Часть моей работы на Лунной базе Бета — помогать тестировать новые исследовательские проекты. Я очень рада показать тебе, над чем работает исследовательская команда Ганимед Роботикс!`,
    choiceIds: [],
    nextId: "explain_telepads_2",
  },
  explain_telepads_2: {
    text:
      `Они создали устройство под названием «телепад», которое может телепортировать относительно небольшие ` +
      `объекты на короткие расстояния. Но... есть одна загвоздка!`,
    choiceIds: ["ask_telepad_catch"],
  },
  explain_telepads_catch: {
    text:
      `Объекты, которые телепортируются, часто непредсказуемо переворачиваются. Так что если ты входишь ` +
      `в телепад лицом в одном направлении, ты можешь оказаться на другой стороне ` +
      `повёрнутым совсем в другую сторону!`,
    choiceIds: ["ack_telepads_catch"],
  },
  explain_telepads_code: {
    text:
      "Чтобы справиться с этим побочным эффектом, тебе нужно использовать функцию `get_orientation`, " +
      `чтобы определить, в какую сторону смотрит Г.Р.О.В.Е.Р. после телепортации. Затем используй оператор if, ` +
      `чтобы обработать каждую возможную ориентацию.`,
    choiceIds: [],
    nextId: "explain_telepads_code_2",
  },
  explain_telepads_code_2: {
    text:
      `Я уже начала писать для тебя код. Как думаешь, сможешь закончить его, добавив ещё ` +
      `операторы if?`,
    choiceIds: ["ack_telepads_code"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_grover_is_repaired: {
    text: "Отлично! Что дальше?",
    nextId: "explain_telepads",
  },
  ask_telepad_catch: {
    text: "Какая загвоздка?",
    nextId: "explain_telepads_catch",
  },
  ack_telepads_catch: {
    text: "Ого... это странно.",
    nextId: "explain_telepads_code",
  },
  ack_telepads_code: {
    text: "Есть только один способ узнать!",
  },
};

export const TREES: DialogTrees = {
  level_telepad_part_one: {
    name: "Непредвиденные эффекты",
    startId: "explain_grover_is_repaired",
  },
};
