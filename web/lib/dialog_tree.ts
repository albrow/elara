// This file contains the dialog trees used for various conversations in the game.
// The dialog trees are defined as a set of nodes (i.e. what the NPC says) and
// choices (i.e. what the player can say in response). Nodes and choices each have
// unique ids which they also use to reference each other. This allows us to create
// branching, possibly recursive dialog trees.

// NodeIds and ChoiceIds must be unique and declared ahead of time. This ensures
// that the compiler will catch any incorrect or missing references.
type NodeIds =
  | "intro"
  | "journey_neg_response"
  | "journey_pos_response"
  | "who_i_am"
  | "where_i_am"
  | "offer_intro_end";
type ChoiceIds =
  | "journey_negative"
  | "journey_positive"
  | "where_are_you"
  | "who_are_you"
  | "intro_end";

export interface DialogNode {
  text: string;
  choiceIds: Array<ChoiceIds>;
  nextId?: NodeIds;
}

export interface DialogChoice {
  text: string;
  nextId?: NodeIds;
}

export interface DialogTree {
  name: string;
  startId: NodeIds;
}

export interface DialogTrees {
  [key: string]: DialogTree;
}

export const NODES: { [key in NodeIds]: DialogNode } = {
  intro: {
    text: "Welcome to Elara! My name is <insert NPC name here>. How was your journey here?",
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
    text: "I'm calling in from Moonbase Bravo, on the southern hemisphere of Elara. It's a small base but I'm happy to call it home, and you can't beat the view!",
    choiceIds: [],
    nextId: "offer_intro_end",
  },
  who_i_am: {
    text: "Well, you already know my name. I'm an engineer here at Ganymede Robotics. I'm also responsible for training new interns, which includes you!",
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
