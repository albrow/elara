import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "kalina_in_trouble"
  | "explain_moonbase_attack_1"
  | "explain_moonbase_attack_2"
  | "moonbase_damage_details"
  | "confirm_kalina_safe"
  | "explain_repair_problem_1"
  | "explain_repair_problem_2"
  | "explain_shutdown_plan_1"
  | "explain_shutdown_plan_2"
  | "clarify_all_rovers"
  | "cant_call_someone"
  | "cant_disable_remotely"
  | "joke_difficult_first_day"
  | "joke_difficult_first_day_2"
  | "kalina_can_help_from_afar";

export type ChoiceIds =
  | "ask_why_kalina_in_trouble"
  | "ask_about_moonbase_damage"
  | "ask_is_kalina_safe"
  | "ask_how_to_help_kalina"
  | "ask_what_to_do_about_moonbase"
  | "ask_clarify_all_rovers"
  | "ack_shutdown_plan"
  | "ask_alternate_call_someone"
  | "ask_alternate_remote_disable"
  | "ack_first_day_joke"
  | "ack_kalina_can_help_from_afar";

export const NODES: { [key in NodeIds]: DialogNode } = {
  kalina_in_trouble: {
    text: "I... think I might be in serious trouble...",
    choiceIds: ["ask_why_kalina_in_trouble"],
  },
  explain_moonbase_attack_1: {
    text: "The malfunctioning rovers are getting really out of hand. Some of them attacked my base!",
    choiceIds: [],
    nextId: "explain_moonbase_attack_2",
  },
  explain_moonbase_attack_2: {
    text: "I'm still not 100% sure why this is happening, but they damaged some critical infrastructure and equipment.",
    choiceIds: ["ask_about_moonbase_damage", "ask_is_kalina_safe"],
  },
  moonbase_damage_details: {
    text: "They damaged the power generator, life support systems, and artificial gravity. The base is on emergency backup power, but that won't last forever.",
    choiceIds: [
      "ask_about_moonbase_damage",
      "ask_is_kalina_safe",
      "ask_how_to_help_kalina",
    ],
  },
  confirm_kalina_safe: {
    text: "I'm safe for now. The malfunctioning rovers won't be able to reach me, but I'm not sure how long I can last.",
    choiceIds: [
      "ask_about_moonbase_damage",
      "ask_is_kalina_safe",
      "ask_how_to_help_kalina",
    ],
  },
  explain_repair_problem_1: {
    text: "Well... I should be able to restore power to the base and get the critical systems up and running again, but I would need to access the control panel outside to do it.",
    choiceIds: [],
    nextId: "explain_repair_problem_2",
  },
  explain_repair_problem_2: {
    text: "It's not safe to attempt repairs while the malfunctioning rovers are still out there!",
    choiceIds: ["ask_what_to_do_about_moonbase"],
  },
  explain_shutdown_plan_1: {
    text: "I have thought of one thing... but it's not going to be easy.",
    choiceIds: [],
    nextId: "explain_shutdown_plan_2",
  },
  explain_shutdown_plan_2: {
    text: "There's an emergency shutdown button in the server room on Moonbase Alpha. If you can guide G.R.O.V.E.R. there and have him press the button, it will shutdown all the rovers on Elara.",
    choiceIds: ["ask_clarify_all_rovers"],
  },
  clarify_all_rovers: {
    text: "That's right, all of them. Unfortunately, that means G.R.O.V.E.R. too. I've been trying to think of an alternative, but there's just no other way. Not with the limited time we have, anyways.",
    choiceIds: [
      "ask_alternate_call_someone",
      "ask_alternate_remote_disable",
      "ack_shutdown_plan",
    ],
  },
  cant_call_someone: {
    text: "There's no one else here on Elara since they automated most operations a few years back. Space is really big, and Jupiter's moons are pretty far apart. It would take days or even weeks to send someone else here.",
    choiceIds: [
      "ask_alternate_call_someone",
      "ask_alternate_remote_disable",
      "ack_shutdown_plan",
    ],
  },
  cant_disable_remotely: {
    text: "Believe me, I've tried. Ever since the rovers started malfunctioning, they haven't been responding to my commands.",
    choiceIds: [
      "ask_alternate_call_someone",
      "ask_alternate_remote_disable",
      "ack_shutdown_plan",
    ],
  },
  joke_difficult_first_day: {
    text: "I know it's a lot to ask...",
    choiceIds: [],
    nextId: "joke_difficult_first_day_2",
  },
  joke_difficult_first_day_2: {
    text: "Not exactly what you expected when you signed up for the internship, huh?",
    choiceIds: ["ack_first_day_joke"],
  },
  kalina_can_help_from_afar: {
    text: "I'll be monitoring your progress and I'll help you out as much as I can from here. You can do it! I'm counting on you!",
    choiceIds: ["ack_kalina_can_help_from_afar"],
  },
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  ask_why_kalina_in_trouble: {
    text: "What happened?",
    nextId: "explain_moonbase_attack_1",
  },
  ask_about_moonbase_damage: {
    text: "What's the damage?",
    nextId: "moonbase_damage_details",
  },
  ask_is_kalina_safe: {
    text: "Are you safe?",
    nextId: "confirm_kalina_safe",
  },
  ask_how_to_help_kalina: {
    text: "Is there anything I can do to help?",
    nextId: "explain_repair_problem_1",
  },
  ask_what_to_do_about_moonbase: {
    text: "Right. So what can we do?",
    nextId: "explain_shutdown_plan_1",
  },
  ask_clarify_all_rovers: {
    text: "Wait... do you mean ALL the rovers?",
    nextId: "clarify_all_rovers",
  },
  ask_alternate_call_someone: {
    text: "Can't we call someone else from Ganymede Robotics?",
    nextId: "cant_call_someone",
  },
  ask_alternate_remote_disable: {
    text: "Isn't there some way to disable the rovers remotely?",
    nextId: "cant_disable_remotely",
  },
  ack_shutdown_plan: {
    text: "Okay, I'll do it.",
    nextId: "joke_difficult_first_day",
  },
  ack_first_day_joke: {
    text: "Tell me about it...",
    nextId: "kalina_can_help_from_afar",
  },
  ack_kalina_can_help_from_afar: {
    text: "No time to waste!",
  },
};

export const TREES: DialogTrees = {
  kalina_in_trouble: {
    name: "Kalina In Trouble",
    startId: "kalina_in_trouble",
  },
};
