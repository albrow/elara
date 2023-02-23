// This file contains the dialog trees used for various conversations in the game.
// The dialog trees are defined as a set of nodes (i.e. what the NPC says) and
// choices (i.e. what the player can say in response). Nodes and choices each have
// unique ids which they also use to reference each other. This allows us to create
// branching, possibly recursive dialog trees.

import * as Intro from "./intro";
import * as Gates from "./level_gates";
import * as GateAndTerminal from "./level_gate_and_terminal";
import * as GateAndTerminalPartTwo from "./level_gate_and_terminal_part_two";
import * as Variables from "./journal_variables";
import * as SeismicActivity from "./level_seismic_activity";

// NodeIds and ChoiceIds must be unique and declared ahead of time. This ensures
// that the compiler will catch any incorrect or missing references.
type NodeIds =
  | Intro.NodeIds
  | Gates.NodeIds
  | GateAndTerminal.NodeIds
  | GateAndTerminalPartTwo.NodeIds
  | Variables.NodeIds
  | SeismicActivity.NodeIds;
type ChoiceIds =
  | Intro.ChoiceIds
  | Gates.ChoiceIds
  | GateAndTerminal.ChoiceIds
  | GateAndTerminalPartTwo.ChoiceIds
  | Variables.ChoiceIds
  | SeismicActivity.ChoiceIds;

export interface DialogNode {
  text: string;
  choiceIds: Array<ChoiceIds>;
  nextId?: NodeIds;
}

export interface DialogChoice {
  text: string;
  nextId?: NodeIds;
}

export interface DialogTree {
  name: string;
  startId: NodeIds;
}

// Mostly used for the UI where we need to differentiate different types of messages.
export interface MsgData {
  id: string;
  text: string;
  isPlayer: boolean;
}

export interface DialogTrees {
  [key: string]: DialogTree;
}

export const NODES: { [key in NodeIds]: DialogNode } = {
  ...Intro.NODES,
  ...Gates.NODES,
  ...GateAndTerminal.NODES,
  ...GateAndTerminalPartTwo.NODES,
  ...Variables.NODES,
  ...SeismicActivity.NODES,
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  ...Intro.CHOICES,
  ...Gates.CHOICES,
  ...GateAndTerminal.CHOICES,
  ...GateAndTerminalPartTwo.CHOICES,
  ...Variables.CHOICES,
  ...SeismicActivity.CHOICES,
};

export const TREES: DialogTrees = {
  ...Intro.TREES,
  ...Gates.TREES,
  ...GateAndTerminal.TREES,
  ...GateAndTerminalPartTwo.TREES,
  ...Variables.TREES,
  ...SeismicActivity.TREES,
};
