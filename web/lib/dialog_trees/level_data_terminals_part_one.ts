import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "lost_recipe_ask_for_help"
  | "explain_lost_recipe_1"
  | "explain_lost_recipe_2"
  | "explain_hummus_ingredients_1"
  | "explain_hummus_ingredients_2"
  | "reiterate_lost_recipe"
  | "explain_data_terminal_1"
  | "explain_data_terminal_2"
  | "remind_use_say_to_get_recipe";
export type ChoiceIds =
  | "lost_recipe_what_is_it"
  | "what_is_a_data_terminal"
  | "how_make_hummus_on_moon"
  | "ack_supply_pod"
  | "ack_data_terminals"
  | "ack_use_say_to_get_recipe";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  lost_recipe_ask_for_help: {
    text: `While we're here, do you think you could help me out with something?`,
    choiceIds: ["lost_recipe_what_is_it"],
  },
  explain_lost_recipe_1: {
    text:
      "So... I used to have this killer hummus recipe stored on my laptop, but I recently " +
      "had to get the laptop replaced and now the recipe is lost!",
    choiceIds: [],
    nextId: "explain_lost_recipe_2",
  },
  explain_lost_recipe_2: {
    text: "The good news is that I have a backup copy of the recipe stored on a nearby data terminal.",
    choiceIds: ["how_make_hummus_on_moon", "what_is_a_data_terminal"],
  },
  explain_hummus_ingredients_1: {
    text:
      "Great question! There's a large greenhouse station orbiting Ganymede. You can't " +
      "grow everything that you could grow on Earth, but we make do with what we have.",
    choiceIds: [],
    nextId: "explain_hummus_ingredients_2",
  },
  explain_hummus_ingredients_2: {
    text: "Every once in a while, they send a supply pod with fresh ingredients.",
    choiceIds: ["ack_supply_pod"],
  },
  reiterate_lost_recipe: {
    text: "Anyways, want to help me retrieve the recipe from the data terminal?",
    choiceIds: ["what_is_a_data_terminal"],
  },
  explain_data_terminal_1: {
    text:
      "Data terminals are scattered around Elara and can store all kinds of information. " +
      "Sometimes they hold important data (like hummus recipes!). Other times they are connected " +
      "to sensors that can provide useful information about the environment.",
    choiceIds: [],
    nextId: "explain_data_terminal_2",
  },
  explain_data_terminal_2: {
    text:
      "You can interact with data terminals by moving G.R.O.V.E.R. next to them and calling the " +
      "read_data function.",
    choiceIds: ["ack_data_terminals"],
  },
  remind_use_say_to_get_recipe: {
    text:
      "So all you need to do is have G.R.O.V.E.R. read the hummus recipe from the data terminal and " +
      "say it using the say function.",
    choiceIds: ["ack_use_say_to_get_recipe"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  lost_recipe_what_is_it: {
    text: "What is it?",
    nextId: "explain_lost_recipe_1",
  },
  what_is_a_data_terminal: {
    text: "What's a data terminal?",
    nextId: "explain_data_terminal_1",
  },
  how_make_hummus_on_moon: {
    text: "Wait a second... how do you have the ingredients to make hummus way out here?",
    nextId: "explain_hummus_ingredients_1",
  },
  ack_supply_pod: {
    text: "Wow, cool!",
    nextId: "reiterate_lost_recipe",
  },
  ack_data_terminals: {
    text: "Understood.",
    nextId: "remind_use_say_to_get_recipe",
  },
  ack_use_say_to_get_recipe: {
    text: "No problem!",
  },
};

export const TREES: DialogTrees = {
  level_data_terminals_part_one: {
    name: "Data Terminals",
    startId: "lost_recipe_ask_for_help",
  },
};
