import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "explain_crates"
  | "explain_crates_2"
  | "explain_low_gravity"
  | "jumping_in_low_grav"
  | "jumping_in_low_grav_2";
export type ChoiceIds =
  | "ack_crates"
  | "ask_about_crate_weight"
  | "ack_low_gravity"
  | "ask_about_jumping"
  | "ack_jumping_in_low_grav";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_crates: {
    text: `Похоже, ящик преграждает путь Г.Р.О.В.Е.Р.у. Но это не проблема...`,
    choiceIds: [],
    nextId: "explain_crates_2",
  },
  explain_crates_2: {
    text: `Г.Р.О.В.Е.Р. может легко поднимать ящики функцией \`pick_up\` и ставить их функцией \`drop\`.`,
    choiceIds: ["ask_about_crate_weight", "ack_crates"],
  },
  explain_low_gravity: {
    text: `Ну, гравитация на Эларе — лишь малая доля от земной. Многие вещи, которые выглядят тяжёлыми, на самом деле лёгкие как пёрышко.`,
    choiceIds: ["ask_about_jumping", "ack_low_gravity"],
  },
  jumping_in_low_grav: {
    text: `Ага! На самом деле, когда я выхожу на поверхность, трудно удержаться на ногах!`,
    choiceIds: [],
    nextId: "jumping_in_low_grav_2",
  },
  jumping_in_low_grav_2: {
    text: "Может, когда-нибудь и ты попробуешь!",
    choiceIds: ["ack_jumping_in_low_grav"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_crates: {
    text: "Поехали!",
  },
  ask_about_crate_weight: {
    text: "Как Г.Р.О.В.Е.Р. может поднять такой большой ящик своей крошечной рукой?",
    nextId: "explain_low_gravity",
  },
  ack_low_gravity: {
    text: "А! Теперь понятно.",
  },
  ask_about_jumping: {
    text: "Значит, можно прыгать очень высоко?",
    nextId: "jumping_in_low_grav",
  },
  ack_jumping_in_low_grav: {
    text: "Ого! Звучит потрясающе.",
  },
};

export const TREES: DialogTrees = {
  level_crates_part_one: {
    name: "Ящики",
    startId: "explain_crates",
  },
};
