import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "explain_password_gates" | "provide_password";
export type ChoiceIds = "request_password" | "ack_password";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_password_gates: {
    text:
      `Похоже, парольный шлюз преграждает путь! В отличие от кнопки, этот тип ` +
      `шлюза можно открыть или закрыть, сказав пароль. Сначала переместите ` +
      "Г.Р.О.В.Е.Р.а рядом со шлюзом, затем произнесите пароль с помощью функции `say`.",
    choiceIds: ["request_password"],
  },
  provide_password: {
    text: `Тебе повезло! Я помню пароль для этого шлюза. Это \`"lovelace"\`.`,
    choiceIds: ["ack_password"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  request_password: {
    text: "Как узнать пароль?",
    nextId: "provide_password",
  },
  ack_password: {
    text: "Понял, спасибо!",
  },
};

export const TREES: DialogTrees = {
  level_gates: {
    name: "Парольные шлюзы",
    startId: "explain_password_gates",
  },
};
