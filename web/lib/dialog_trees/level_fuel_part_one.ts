import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds = "explain_fuel_1" | "explain_fuel_2";
export type ChoiceIds = "ack_fuel";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_fuel_1: {
    text: "That little number next to the rover is the current amount fuel. Moving the rover uses 1 fuel for each space.",
    choiceIds: [],
    nextId: "explain_fuel_2",
  },
  explain_fuel_2: {
    text: "If you run out of fuel, you will fail the objective. You can pick up additional fuel by simply moving into a space that contains it.",
    choiceIds: ["ack_fuel"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_fuel: {
    text: "Got it!",
  },
};

export const TREES: DialogTrees = {
  level_fuel_part_one: {
    name: "Fuel",
    startId: "explain_fuel_1",
  },
};
