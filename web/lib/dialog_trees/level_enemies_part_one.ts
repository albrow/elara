import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "evil_rover_no_walls"
  | "explain_evil_rover_will_chase"
  | "explain_cause_of_malfunction"
  | "offer_explain_cause_of_malfunction"
  | "offer_explain_evil_rover_will_chase"
  | "stay_away_from_evil_rover";
export type ChoiceIds =
  | "what_is_evil_rover_doing"
  | "what_is_cause_of_malfunction"
  | "ack_evil_rover_will_chase"
  | "ack_cause_of_malfunction"
  | "no_more_evil_rover_questions"
  | "ack_stay_away_from_evil_rover";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  evil_rover_no_walls: {
    text: "Look out! There's another malfunctioning rover ahead. It looks like there are no rocks blocking it this time.",
    choiceIds: ["what_is_evil_rover_doing", "what_is_cause_of_malfunction"],
  },
  explain_evil_rover_will_chase: {
    text: "I've spent some time analyzing the rover's behavior. Unfortunately, it looks like it thinks that G.R.O.V.E.R. is trash or debris, so it's going to try to err... dispose of him.",
    choiceIds: ["ack_evil_rover_will_chase"],
  },
  explain_cause_of_malfunction: {
    text: "I'm still not sure. It could be a solar flare, or maybe a bug in the software. I'll keep investigating.",
    choiceIds: ["ack_cause_of_malfunction"],
  },
  offer_explain_cause_of_malfunction: {
    text: "Anything else you want to know about the malfunctioning rovers?",
    choiceIds: ["what_is_cause_of_malfunction", "no_more_evil_rover_questions"],
  },
  offer_explain_evil_rover_will_chase: {
    text: "Anything else you want to know about the malfunctioning rovers?",
    choiceIds: ["what_is_evil_rover_doing", "no_more_evil_rover_questions"],
  },
  stay_away_from_evil_rover: {
    text: "Just make sure to stay away from it and you should be fine.",
    choiceIds: ["ack_stay_away_from_evil_rover"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  what_is_evil_rover_doing: {
    text: "What is it doing?",
    nextId: "explain_evil_rover_will_chase",
  },
  ack_evil_rover_will_chase: {
    text: "Oh no! I'll try to make sure that doesn't happen.",
    nextId: "offer_explain_cause_of_malfunction",
  },
  what_is_cause_of_malfunction: {
    text: "Why are these rovers malfunctioning?",
    nextId: "explain_cause_of_malfunction",
  },
  ack_cause_of_malfunction: {
    text: "I see. Hopefully you can figure it out soon.",
    nextId: "offer_explain_evil_rover_will_chase",
  },
  no_more_evil_rover_questions: {
    text: "No, that's all I need to know for now.",
    nextId: "stay_away_from_evil_rover",
  },
  ack_stay_away_from_evil_rover: {
    text: "Okay, I'll do my best!",
  },
};

export const TREES: DialogTrees = {
  level_enemies_part_one: {
    name: "Malfunction Detected",
    startId: "evil_rover_no_walls",
  },
};
