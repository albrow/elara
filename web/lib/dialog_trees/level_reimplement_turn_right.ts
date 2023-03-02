import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "right_turns_ahead"
  | "right_turns_ahead_2"
  | "idea_to_turn_right"
  | "idea_to_turn_right_2"
  | "three_lefts_will_take_longer";
export type ChoiceIds =
  | "how_to_turn_right"
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
    text: `Oh I have an idea! You know the saying "three lefts make a right"?`,
    choiceIds: [],
    nextId: "idea_to_turn_right_2",
  },
  idea_to_turn_right_2: {
    text:
      "Well, I think we can use that to our advantage here. Why don't you try making " +
      "a new function that just turns G.R.O.V.E.R. three times to the left?",
    choiceIds: ["wont_three_lefts_take_longer", "ack_idea_to_turn_right"],
  },
  three_lefts_will_take_longer: {
    text:
      "Yeah, it would take three times as long. But it means you can write a " +
      "lot fewer lines of code! Besides, it's only temporary until we can get G.R.O.V.E.R. repaired.",
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
  ack_idea_to_turn_right: {
    text: "I'll give it a try!",
  },
  wont_three_lefts_take_longer: {
    text: "Won't that take a lot longer?",
    nextId: "three_lefts_will_take_longer",
  },
};

export const TREES: DialogTrees = {
  level_reimplement_turn_right: {
    name: "Reimplement the turn_right function",
    startId: "right_turns_ahead",
  },
};
