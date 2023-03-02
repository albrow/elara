// This file contains the dialog trees used for various conversations in the game.
// The dialog trees are defined as a set of nodes (i.e. what the NPC says) and
// choices (i.e. what the player can say in response). Nodes and choices each have
// unique ids which they also use to reference each other. This allows us to create
// branching, possibly recursive dialog trees.

import * as Intro from "./intro";
import * as Gates from "./level_gates";
import * as GateAndTerminal from "./level_gate_and_terminal";
import * as GateAndTerminalPartThree from "./level_gate_and_terminal_part_three";
import * as Variables from "./journal_variables";
import * as SeismicActivity from "./level_seismic_activity";
import * as PartlyDisabledMovement from "./level_partly_disabled_movement";
import * as ReImplementTurnRight from "./level_reimplement_turn_right";

// NodeIds and ChoiceIds must be unique and declared ahead of time. This ensures
// that the compiler will catch any incorrect or missing references.
type NodeIds =
  | Intro.NodeIds
  | Gates.NodeIds
  | GateAndTerminal.NodeIds
  | GateAndTerminalPartThree.NodeIds
  | Variables.NodeIds
  | SeismicActivity.NodeIds
  | PartlyDisabledMovement.NodeIds
  | ReImplementTurnRight.NodeIds;
type ChoiceIds =
  | Intro.ChoiceIds
  | Gates.ChoiceIds
  | GateAndTerminal.ChoiceIds
  | GateAndTerminalPartThree.ChoiceIds
  | Variables.ChoiceIds
  | SeismicActivity.ChoiceIds
  | PartlyDisabledMovement.ChoiceIds
  | ReImplementTurnRight.ChoiceIds;

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
  ...GateAndTerminalPartThree.NODES,
  ...Variables.NODES,
  ...SeismicActivity.NODES,
  ...PartlyDisabledMovement.NODES,
  ...ReImplementTurnRight.NODES,
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  ...Intro.CHOICES,
  ...Gates.CHOICES,
  ...GateAndTerminal.CHOICES,
  ...GateAndTerminalPartThree.CHOICES,
  ...Variables.CHOICES,
  ...SeismicActivity.CHOICES,
  ...PartlyDisabledMovement.CHOICES,
  ...ReImplementTurnRight.CHOICES,
};

export const TREES: DialogTrees = {
  ...Intro.TREES,
  ...Gates.TREES,
  ...GateAndTerminal.TREES,
  ...GateAndTerminalPartThree.TREES,
  ...Variables.TREES,
  ...SeismicActivity.TREES,
  ...PartlyDisabledMovement.TREES,
  ...ReImplementTurnRight.TREES,
};
