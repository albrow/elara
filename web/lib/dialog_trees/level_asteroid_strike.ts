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
      `Be careful! It looks like we're passing through an asteroid field. The detectors are predicting ` +
      `a strong possibility of strikes.`,
    choiceIds: ["meteor_showers_are_nbd", "which_way_is_safe"],
  },
  not_like_meteor_showers_on_earth: {
    text:
      `Well.. this won't be like the meteor showers you're used to. On Earth, the atmosphere burns up ` +
      `most asteroids before they hit the ground. Here on Elara, there is no atmosphere, so there's nothing ` +
      `to protect us from impacts.`,
    choiceIds: [],
    nextId: "explain_asteroid_sensors",
  },
  explain_asteroid_sensors: {
    text: "That's why we have asteroid detectors. They can warn us about incoming asteroids so we have time to react.",
    choiceIds: ["which_way_is_safe"],
  },
  explain_sensor_direction: {
    text:
      `There's a data point ahead which is connected to an asteroid detector. ` +
      `It can tell you which way is safe to go.`,
    choiceIds: [],
    nextId: "explain_possible_paths",
  },
  explain_possible_paths: {
    text:
      `The safe direction seems random and can change over time, so you need to ` +
      `handle *both* cases. Basically, if the data point outputs \`"left"\`, then you ` +
      `should go left. If it outputs \`"right"\`, then you should go right.`,
    choiceIds: ["ack_possible_paths"],
  },
  explain_asteroid_strike_existing_code_1: {
    text:
      `I've already written some code for you that reads the data ` +
      "and stores it in a variable called `safe_direction`.",
    choiceIds: [],
    nextId: "explain_asteroid_strike_existing_code_2",
  },
  explain_asteroid_strike_existing_code_2: {
    text:
      `I also started the if statement for you. You just need to add some code to ` +
      `handle the case where \`safe_direction\` is \`"right"\`.`,
    choiceIds: ["ack_asteroid_strike_existing_code"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  which_way_is_safe: {
    text: "How do I avoid the falling asteroids?",
    nextId: "explain_sensor_direction",
  },
  meteor_showers_are_nbd: {
    text: "I love meteor showers! Can I make a wish?",
    nextId: "not_like_meteor_showers_on_earth",
  },
  ack_possible_paths: {
    text: "Okay. That doesn't sound too hard.",
    nextId: "explain_asteroid_strike_existing_code_1",
  },
  ack_asteroid_strike_existing_code: {
    text: "Got it. Let's do this!",
  },
};

export const TREES: DialogTrees = {
  level_asteroid_strike: {
    name: "Asteroid Strike",
    startId: "explain_asteroid_strike",
  },
};
