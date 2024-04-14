import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "explain_crates"
  | "explain_crates_2"
  | "explain_low_gravity"
  | "jumping_in_low_grav"
  | "jumping_in_low_grav_2";
export type ChoiceIds =
  | "ack_crates"
  | "ask_about_crate_weight"
  | "ack_low_gravity"
  | "ask_about_jumping"
  | "ack_jumping_in_low_grav";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  explain_crates: {
    text: `Looks like there's a crate blocking G.R.O.V.E.R.'s path. Not a problem though...`,
    choiceIds: [],
    nextId: "explain_crates_2",
  },
  explain_crates_2: {
    text: `G.R.O.V.E.R. can easily pick up crates with the \`pick_up\` function and drop them with the \`drop\` function.`,
    choiceIds: ["ask_about_crate_weight", "ack_crates"],
  },
  explain_low_gravity: {
    text: `Well, the gravity on Elara is a tiny fraction of what it is on Earth. A lot of things that look heavy are really light as a feather.`,
    choiceIds: ["ask_about_jumping", "ack_low_gravity"],
  },
  jumping_in_low_grav: {
    text: `Yeah! In fact, when I go out on the surface it's hard to keep my feet on the ground!`,
    choiceIds: [],
    nextId: "jumping_in_low_grav_2",
  },
  jumping_in_low_grav_2: {
    text: "Maybe you'll get to try it sometime!",
    choiceIds: ["ack_jumping_in_low_grav"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_crates: {
    text: "Let's go!",
  },
  ask_about_crate_weight: {
    text: "How can G.R.O.V.E.R. pick up that big crate with his tiny little arm?",
    nextId: "explain_low_gravity",
  },
  ack_low_gravity: {
    text: "Oh! That makes sense.",
  },
  ask_about_jumping: {
    text: "Does that mean you can jump really high?",
    nextId: "jumping_in_low_grav",
  },
  ack_jumping_in_low_grav: {
    text: "Wow! That sounds really amazing.",
  },
};

export const TREES: DialogTrees = {
  level_crates_part_one: {
    name: "Crates",
    startId: "explain_crates",
  },
};
