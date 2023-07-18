import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "intro"
  | "journey_neg_response"
  | "journey_pos_response"
  | "who_i_am"
  | "where_i_am"
  | "where_you_are"
  | "offer_intro_end";
export type ChoiceIds =
  | "journey_negative"
  | "journey_positive"
  | "where_are_you"
  | "who_are_you"
  | "where_am_i"
  | "intro_end";

export const NODES: { [key in NodeIds]: DialogNode } = {
  intro: {
    text: "Welcome to Elara! My name is Kalina. How was your journey here?",
    choiceIds: ["journey_negative", "journey_positive"],
  },
  journey_neg_response: {
    text: "Yeah.. I know the feeling. Luckily it is something you get used to.",
    choiceIds: ["who_are_you", "where_am_i", "where_are_you"],
  },
  journey_pos_response: {
    text: "Wow you must be lucky! I was space-lagged for days after my first trip.",
    choiceIds: ["who_are_you", "where_am_i", "where_are_you"],
  },
  where_i_am: {
    text:
      "I'm calling in from Moonbase Beta, on the southern hemisphere of Elara. " +
      "It's a small base, but I'm happy to call it home. And you can't beat the view!",
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
  where_you_are: {
    text:
      "The space-lag must have hit you hard, huh? No worries! It'll all come back to you soon. " +
      "If you look out the window, you should see a weirdly shaped moon. That's Elara! " +
      "You're currently orbiting around it in a small module.",
    choiceIds: [],
    nextId: "offer_intro_end",
  },
  offer_intro_end: {
    text: "Ready to get started with training or do you have any other questions?",
    choiceIds: ["who_are_you", "where_am_i", "where_are_you", "intro_end"],
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
  where_am_i: {
    text: "Where am I?",
    nextId: "where_you_are",
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
