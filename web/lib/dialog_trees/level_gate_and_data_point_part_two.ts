import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "do_you_see_evil_rover"
  | "point_out_evil_rover_sighting"
  | "ack_evil_rover_sighting"
  | "evil_rover_cant_get_you"
  | "carry_on_while_i_check_evil_rover";
export type ChoiceIds =
  | "evil_rover_see_what"
  | "evil_rover_confirm_sighting"
  | "ack_evil_rover_cant_get_you"
  | "ack_carry_on_while_i_check_evil_rover";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  do_you_see_evil_rover: {
    text: "Uh oh.. do you see that?",
    choiceIds: ["evil_rover_see_what", "evil_rover_confirm_sighting"],
  },
  point_out_evil_rover_sighting: {
    text: "Right there! It looks like another malfunctioning rover. I was really hoping we wouldn't see another one.",
    choiceIds: [],
    nextId: "evil_rover_cant_get_you",
  },
  ack_evil_rover_sighting: {
    text: "Good, I'm glad I'm not the only one. I was really hoping we wouldn't see another malfunctioning rover.",
    choiceIds: [],
    nextId: "evil_rover_cant_get_you",
  },
  evil_rover_cant_get_you: {
    text: "The good news is it doesn't look like it can reach G.R.O.V.E.R. for now. There's a wall in the way.",
    choiceIds: ["ack_evil_rover_cant_get_you"],
  },
  carry_on_while_i_check_evil_rover: {
    text: "I'm going to focus on investigating these malfunctions. You just keep doing what you're doing. You're doing great so far!",
    choiceIds: ["ack_carry_on_while_i_check_evil_rover"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  evil_rover_see_what: {
    text: "See what?",
    nextId: "point_out_evil_rover_sighting",
  },
  evil_rover_confirm_sighting: {
    text: "Yeah, I see it too.",
    nextId: "ack_evil_rover_sighting",
  },
  ack_evil_rover_cant_get_you: {
    text: "Phew, that's good.",
    nextId: "carry_on_while_i_check_evil_rover",
  },
  ack_carry_on_while_i_check_evil_rover: {
    text: "Thanks! Will do.",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_point_part_two: {
    name: "Slipped My Mind",
    startId: "do_you_see_evil_rover",
  },
};
