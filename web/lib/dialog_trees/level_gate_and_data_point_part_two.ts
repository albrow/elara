import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "do_you_see_evil_rover"
  | "point_out_evil_rover_sighting"
  | "ack_evil_rover_sighting"
  | "evil_rover_cant_get_you"
  | "explain_why_grover_isnt_affected"
  | "carry_on_while_i_check_evil_rover";
export type ChoiceIds =
  | "evil_rover_see_what"
  | "evil_rover_confirm_sighting"
  | "ask_why_grover_isnt_affected"
  | "ack_carry_on_while_i_check_evil_rover";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  do_you_see_evil_rover: {
    text: "Uh oh.. do you see that?",
    choiceIds: ["evil_rover_see_what", "evil_rover_confirm_sighting"],
  },
  point_out_evil_rover_sighting: {
    text: "Right there! It looks like another malfunctioning rover. Seems like somehow the problem is spreading.",
    choiceIds: [],
    nextId: "evil_rover_cant_get_you",
  },
  ack_evil_rover_sighting: {
    text: "Good, I'm glad I'm not the only one. It seems like more and more rovers are being affected by the malfunctions.",
    choiceIds: [],
    nextId: "evil_rover_cant_get_you",
  },
  evil_rover_cant_get_you: {
    text: "The good news is it doesn't look like this one can reach G.R.O.V.E.R. for now. There are some rocks in the way.",
    choiceIds: ["ask_why_grover_isnt_affected"],
  },
  explain_why_grover_isnt_affected: {
    text: "I'm not sure. Since G.R.O.V.E.R. is specifically designed for training purposes, he runs on a different operating system than the other rovers. That might mean he's not affected by the same malfunctions.",
    choiceIds: [],
    nextId: "carry_on_while_i_check_evil_rover",
  },
  carry_on_while_i_check_evil_rover: {
    text: "I'm going to focus on investigating the problem. You just keep doing what you're doing. You're doing great so far!",
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
  ask_why_grover_isnt_affected: {
    text: "Is G.R.O.V.E.R. going to start malfunctioning too?",
    nextId: "explain_why_grover_isnt_affected",
  },
  ack_carry_on_while_i_check_evil_rover: {
    text: "Thanks! Will do.",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_data_point_part_two: {
    name: "Slipped My Mind",
    startId: "do_you_see_evil_rover",
  },
};
