import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "intro"
  | "journey_neg_response"
  | "journey_pos_response"
  | "who_i_am"
  | "where_i_am"
  | "offer_intro_end";
export type ChoiceIds =
  | "journey_negative"
  | "journey_positive"
  | "where_are_you"
  | "who_are_you"
  | "intro_end";

export const NODES: { [key in NodeIds]: DialogNode } = {
  intro: {
    text: "Welcome to Elara! My name is Kalina. How was your journey here?",
    choiceIds: ["journey_negative", "journey_positive"],
  },
  journey_neg_response: {
    text: "Yeah.. I know the feeling. Luckily it is something you get used to.",
    choiceIds: ["where_are_you", "who_are_you"],
  },
  journey_pos_response: {
    text: "That's great!",
    choiceIds: ["where_are_you", "who_are_you"],
  },
  where_i_am: {
    text:
      "I'm calling in from Moonbase Bravo, on the southern hemisphere of Elara. " +
      "It's a small base but I'm happy to call it home, and you can't beat the view!",
    choiceIds: [],
    nextId: "offer_intro_end",
  },
  who_i_am: {
    text:
      "Well, you already know my name. I'm an engineer here at Ganymede Robotics. " +
      "I'm also responsible for training new interns, which includes you!",
    choiceIds: [],
    nextId: "offer_intro_end",
  },
  offer_intro_end: {
    text: "Ready to get started with training or do you have any other questions?",
    choiceIds: ["intro_end", "where_are_you", "who_are_you"],
  },
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  journey_negative: {
    text: "Still feeling a little space-lagged.",
    nextId: "journey_neg_response",
  },
  journey_positive: {
    text: "No complaints.",
    nextId: "journey_pos_response",
  },
  where_are_you: {
    text: "Where are you calling from?",
    nextId: "where_i_am",
  },
  who_are_you: {
    text: "Who are you exactly?",
    nextId: "who_i_am",
  },
  intro_end: {
    text: "Let's go!",
  },
};

export const TREES: DialogTrees = {
  intro: {
    name: "Intro",
    startId: "intro",
  },
};
