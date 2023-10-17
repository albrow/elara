import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "good_job_on_first_level"
  | "explain_journal_1"
  | "explain_journal_2"
  | "explain_where_to_find_journal";
export type ChoiceIds =
  | "ack_good_job_on_first_level"
  | "ask_where_to_find_journal"
  | "ack_journal";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  good_job_on_first_level: {
    text: "Nice work! Seems like you understand the basics of how to deploy and run your code.",
    choiceIds: ["ack_good_job_on_first_level"],
  },
  explain_journal_1: {
    text: "Before we can continue, you should take a look at the Ganymede Robotics Training Journal. The journal will help teach you important concepts with videos and interactive examples.",
    nextId: "explain_journal_2",
    choiceIds: [],
  },
  explain_journal_2: {
    text: "Things are going to start out easy, but it'll get harder as you go along, so make sure you read the journal and watch the videos carefully!",
    choiceIds: ["ask_where_to_find_journal"],
  },
  explain_where_to_find_journal: {
    text: "You should see it right next to your computer.",
    choiceIds: ["ack_journal"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ack_good_job_on_first_level: {
    text: "Thanks!",
    nextId: "explain_journal_1",
  },
  ask_where_to_find_journal: {
    text: "Where can I find the journal?",
    nextId: "explain_where_to_find_journal",
  },
  ack_journal: {
    text: "Got it!",
  },
};

export const TREES: DialogTrees = {
  explain_journal: {
    name: "How the Journal Works",
    startId: "good_job_on_first_level",
  },
};
