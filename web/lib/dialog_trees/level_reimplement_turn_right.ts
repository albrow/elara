import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "right_turns_ahead"
  | "right_turns_ahead_2"
  | "idea_to_turn_right"
  | "not_might_makes_a_right"
  | "not_two_negatives"
  | "how_to_use_three_lefts"
  | "three_lefts_will_take_longer";
export type ChoiceIds =
  | "how_to_turn_right"
  | "guess_might_makes_a_right"
  | "guess_three_lefts_make_a_right"
  | "guess_two_negatives"
  | "ack_idea_to_turn_right"
  | "wont_three_lefts_take_longer";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  right_turns_ahead: {
    text:
      "We may have a slight problem here... It looks like the path ahead has " +
      "a lot of right turns, but at the moment G.R.O.V.E.R. can only turn left.",
    choiceIds: [],
    nextId: "right_turns_ahead_2",
  },
  right_turns_ahead_2: {
    text: "It would be *really* convenient if G.R.O.V.E.R. could turn right somehow.",
    choiceIds: ["how_to_turn_right"],
  },
  idea_to_turn_right: {
    text:
      `Oh I have an idea! You know the saying "two wrongs don't make a right"? Well... ` +
      `what does make a right?`,
    choiceIds: [
      "guess_might_makes_a_right",
      "guess_three_lefts_make_a_right",
      "guess_two_negatives",
    ],
  },
  not_might_makes_a_right: {
    text: `I have heard the saying "might makes right", but that's not what I had in mind. Guess again?`,
    choiceIds: [
      "guess_might_makes_a_right",
      "guess_three_lefts_make_a_right",
      "guess_two_negatives",
    ],
  },
  not_two_negatives: {
    text:
      `Sure, if you multiply two negative numbers together you get a positive number, ` +
      `but I was thinking of something different. Guess again?`,
    choiceIds: [
      "guess_might_makes_a_right",
      "guess_three_lefts_make_a_right",
      "guess_two_negatives",
    ],
  },
  how_to_use_three_lefts: {
    text:
      "Exactly! Why don't you try making a new function that just turns G.R.O.V.E.R. " +
      "three times to the left?",
    choiceIds: ["wont_three_lefts_take_longer", "ack_idea_to_turn_right"],
  },
  three_lefts_will_take_longer: {
    text:
      "Yeah, it would take three times as long for G.R.O.V.E.R. to turn that way. But it " +
      "means you can write fewer lines of code! Besides, it's only temporary until we can get him repaired.",
    choiceIds: ["ack_idea_to_turn_right"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  how_to_turn_right: {
    text: "Any ideas?",
    nextId: "idea_to_turn_right",
  },
  guess_might_makes_a_right: {
    text: "Might?",
    nextId: "not_might_makes_a_right",
  },
  guess_three_lefts_make_a_right: {
    text: "Three lefts?",
    nextId: "how_to_use_three_lefts",
  },
  guess_two_negatives: {
    text: "Two negatives?",
    nextId: "not_two_negatives",
  },
  ack_idea_to_turn_right: {
    text: "I'll give it a try!",
  },
  wont_three_lefts_take_longer: {
    text: "Won't that take longer?",
    nextId: "three_lefts_will_take_longer",
  },
};

export const TREES: DialogTrees = {
  level_reimplement_turn_right: {
    name: "Reimplement the turn_right function",
    startId: "right_turns_ahead",
  },
};
