import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "gate_is_locked" | "explain_buttons";
export type ChoiceIds = "ask_about_locked_gate" | "ack_buttons";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  gate_is_locked: {
    text: `Хмм... странно. Интересно, почему эти ворота заблокированы?`,
    choiceIds: ["ask_about_locked_gate"],
  },
  explain_buttons: {
    text: `О, похоже, рядом есть кнопка, которая может их разблокировать! Просто подведи Г.Р.О.В.Е.Р.а к кнопке и вызови функцию \`press_button\`.`,
    choiceIds: ["ack_buttons"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ask_about_locked_gate: {
    text: "О нет! Что мне теперь делать?",
    nextId: "explain_buttons",
  },
  ack_buttons: {
    text: "Звучит достаточно просто!",
  },
};

export const TREES: DialogTrees = {
  level_button_and_gate: {
    name: "Кнопки",
    startId: "gate_is_locked",
  },
};
