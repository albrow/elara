import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "explain_multi_data_points";
export type ChoiceIds = "ack_multi_data_points";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_multi_data_points: {
    text:
      "Хмм... на этот раз здесь несколько точек данных. Я знаю, что одна из них " +
      "содержит пароль, но не уверена какая именно.",
    choiceIds: ["ack_multi_data_points"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_multi_data_points: {
    text: "Не проблема! Просто проверю их по очереди.",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_data_point_part_three: {
    name: "Несколько точек данных",
    startId: "explain_multi_data_points",
  },
};
