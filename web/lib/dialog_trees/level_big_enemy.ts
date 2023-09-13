import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "greta_ahead"
  | "explain_greta"
  | "sneak_past_greta"
  | "greta_telepad_plan_1"
  | "greta_telepad_plan_2"
  | "greta_telepad_plan_3"
  | "final_encouragement"
  | "cant_finish_for_you_1"
  | "cant_finish_for_you_2"
  | "final_encouragement_again";
export type ChoiceIds =
  | "ack_greta"
  | "greta_already_sees_grover"
  | "ack_telepad_plan"
  | "express_final_doubt"
  | "ask_kalina_to_finish"
  | "ack_final_encouragement";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  greta_ahead: {
    text: "Uh oh! It looks like big trouble ahead!",
    choiceIds: [],
    nextId: "explain_greta",
  },
  explain_greta: {
    text: "That huge robot is named G.R.E.T.A. Normally she's used for moonscaping and construction projects, but it looks like she's malfunctioning too!",
    choiceIds: ["ack_greta"],
  },
  sneak_past_greta: {
    text: "You'll have to find some way to sneak past her.",
    choiceIds: ["greta_already_sees_grover"],
  },
  greta_telepad_plan_1: {
    text: "Hmm...",
    choiceIds: [],
    nextId: "greta_telepad_plan_2",
  },
  greta_telepad_plan_2: {
    text: "Well I think I have half a plan.. you can start by using the nearby telepads to to keep G.R.O.V.E.R. out of her reach.",
    choiceIds: [],
    nextId: "greta_telepad_plan_3",
  },
  greta_telepad_plan_3: {
    text: "I can help you get started with a handy function I wrote called `face_direction`. I added some comments to explain how it works.",
    choiceIds: ["ack_telepad_plan"],
  },
  final_encouragement: {
    text: "I don't know. But with everything you've learned so far, I'm confident you can think of something! I'm counting on you!",
    choiceIds: [
      "express_final_doubt",
      "ask_kalina_to_finish",
      "ack_final_encouragement",
    ],
  },
  cant_finish_for_you_1: {
    text: "I'm sorry, but that's not an option. My computer is pretty much fried right now and I'm on backup emergency power.",
    choiceIds: [],
    nextId: "cant_finish_for_you_2",
  },
  cant_finish_for_you_2: {
    text: "I can help you get started, but you're the only one who can write the rest of the code.",
    choiceIds: [
      "express_final_doubt",
      "ask_kalina_to_finish",
      "ack_final_encouragement",
    ],
  },
  final_encouragement_again: {
    text: "I know you can do it! You've come a long way since we first met. You're shaping up to be a great programmer!",
    choiceIds: [
      "express_final_doubt",
      "ask_kalina_to_finish",
      "ack_final_encouragement",
    ],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_greta: {
    text: "I can see that. What should I do?",
    nextId: "sneak_past_greta",
  },
  greta_already_sees_grover: {
    text: "It might be too late. She's looking right at G.R.O.V.E.R.!",
    nextId: "greta_telepad_plan_1",
  },
  ack_telepad_plan: {
    text: "Thanks! That's a big help. What's the rest of the plan?",
    nextId: "final_encouragement",
  },
  express_final_doubt: {
    text: "I'm not so sure...",
    nextId: "final_encouragement_again",
  },
  ask_kalina_to_finish: {
    text: "Can't you do this? You're more experienced than I am.",
    nextId: "cant_finish_for_you_1",
  },
  ack_final_encouragement: {
    text: "Okay, here it goes. I can do this!",
  },
};

export const TREES: DialogTrees = {
  level_big_enemy: {
    name: "Big Trouble",
    startId: "greta_ahead",
  },
};
