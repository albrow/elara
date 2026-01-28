import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "lot_of_telepads"
  | "idea_for_telepads"
  | "telepad_while_loop_idea"
  | "elaborate_while_loop_idea"
  | "explain_face_up_func"
  | "explain_face_up_func_2";
export type ChoiceIds =
  | "ack_lot_of_telepads"
  | "ack_while_loop_idea"
  | "ask_about_while_loops"
  | "ack_face_up_func";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  lot_of_telepads: {
    text: `Ого, сколько же тут телепадов!`,
    choiceIds: ["ack_lot_of_telepads"],
  },
  idea_for_telepads: {
    text: "У меня есть идея!",
    choiceIds: [],
    nextId: "telepad_while_loop_idea",
  },
  telepad_while_loop_idea: {
    text: `Вместо того чтобы использовать много операторов if для обработки каждого возможного направления, в которое может смотреть Г.Р.О.В.Е.Р., можно использовать цикл while.`,
    choiceIds: ["ack_while_loop_idea", "ask_about_while_loops"],
  },
  elaborate_while_loop_idea: {
    text: `Циклы while можно использовать для повторного выполнения кода, пока не будет выполнено определённое условие. В нашем случае мы используем это, чтобы Г.Р.О.В.Е.Р. поворачивался, пока не будет смотреть вверх, независимо от того, в каком направлении он смотрел в начале.`,
    choiceIds: ["ack_while_loop_idea"],
  },
  explain_face_up_func: {
    text: "Я начну писать для тебя код, создав новую функцию `face_up`, которая использует идею с циклом while.",
    choiceIds: [],
    nextId: "explain_face_up_func_2",
  },
  explain_face_up_func_2: {
    text: "Затем ты можешь использовать функцию `face_up` в своём коде. Это должно значительно упростить работу с телепадами!",
    choiceIds: ["ack_face_up_func"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_lot_of_telepads: {
    text: `Это точно...`,
    nextId: "idea_for_telepads",
  },
  ack_while_loop_idea: {
    text: `Понятно! Довольно умно.`,
    nextId: "explain_face_up_func",
  },
  ask_about_while_loops: {
    text: `Не понимаю. Что ты имеешь в виду?`,
    nextId: "elaborate_while_loop_idea",
  },
  ack_face_up_func: {
    text: `Отлично, спасибо!`,
  },
};

export const TREES: DialogTrees = {
  level_telepads_and_while_loop: {
    name: "Телепады и циклы While",
    startId: "lot_of_telepads",
  },
};
