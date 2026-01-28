import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "explain_asteroid_strike"
  | "explain_sensor_direction"
  | "not_like_meteor_showers_on_earth"
  | "explain_asteroid_sensors"
  | "explain_possible_paths"
  | "explain_asteroid_strike_existing_code_1"
  | "explain_asteroid_strike_existing_code_2";
export type ChoiceIds =
  | "which_way_is_safe"
  | "meteor_showers_are_nbd"
  | "ack_possible_paths"
  | "ack_asteroid_strike_existing_code";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_asteroid_strike: {
    text:
      `Осторожно! Похоже, мы проходим через пояс астероидов. Детекторы показывают ` +
      `высокую вероятность столкновений.`,
    choiceIds: ["meteor_showers_are_nbd", "which_way_is_safe"],
  },
  not_like_meteor_showers_on_earth: {
    text:
      `Ну... это будет не похоже на звездопады, к которым ты привык. На Земле атмосфера ` +
      `сжигает большинство астероидов до того, как они достигнут поверхности. Здесь, на Эларе, атмосферы нет, ` +
      `так что нас ничто не защищает от ударов.`,
    choiceIds: [],
    nextId: "explain_asteroid_sensors",
  },
  explain_asteroid_sensors: {
    text: "Вот почему у нас есть детекторы астероидов. Они могут предупредить нас о приближающихся астероидах, чтобы мы успели среагировать.",
    choiceIds: ["which_way_is_safe"],
  },
  explain_sensor_direction: {
    text:
      `Впереди есть точка данных, подключённая к детектору астероидов. ` +
      `Она может подсказать, в какую сторону безопасно двигаться.`,
    choiceIds: [],
    nextId: "explain_possible_paths",
  },
  explain_possible_paths: {
    text:
      `Безопасное направление выбирается случайно и может меняться со временем, поэтому нужно ` +
      `обработать *оба* случая. Если точка данных выдаёт \`"left"\`, то нужно ` +
      `пойти налево. Если выдаёт \`"right"\`, то нужно пойти направо.`,
    choiceIds: ["ack_possible_paths"],
  },
  explain_asteroid_strike_existing_code_1: {
    text:
      `Я уже написала для тебя код, который считывает данные ` +
      "и сохраняет их в переменную `safe_direction`.",
    choiceIds: [],
    nextId: "explain_asteroid_strike_existing_code_2",
  },
  explain_asteroid_strike_existing_code_2: {
    text:
      `Я также начала оператор if для тебя. Тебе нужно только добавить код для ` +
      `обработки случая, когда \`safe_direction\` равно \`"right"\`.`,
    choiceIds: ["ack_asteroid_strike_existing_code"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  which_way_is_safe: {
    text: "Как мне избежать падающих астероидов?",
    nextId: "explain_sensor_direction",
  },
  meteor_showers_are_nbd: {
    text: "Я люблю звездопады! Можно загадать желание?",
    nextId: "not_like_meteor_showers_on_earth",
  },
  ack_possible_paths: {
    text: "Хорошо. Звучит не слишком сложно.",
    nextId: "explain_asteroid_strike_existing_code_1",
  },
  ack_asteroid_strike_existing_code: {
    text: "Понял. Давай сделаем это!",
  },
};

export const TREES: DialogTrees = {
  level_asteroid_strike: {
    name: "Удар астероида",
    startId: "explain_asteroid_strike",
  },
};
