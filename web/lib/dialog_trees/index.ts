// This file contains the dialog trees used for various conversations in the game.
// The dialog trees are defined as a set of nodes (i.e. what the NPC says) and
// choices (i.e. what the player can say in response). Nodes and choices each have
// unique ids which they also use to reference each other. This allows us to create
// branching, possibly recursive dialog trees.

import {
  IntroNodeIds,
  IntroChoiceIds,
  INTRO_NODES,
  INTRO_CHOICES,
  INTRO_TREES,
} from "./intro";

import {
  LevelMovementNodeIds,
  LevelMovementChoiceIds,
  LEVEL_MOVEMENT_NODES,
  LEVEL_MOVEMENT_CHOICES,
  LEVEL_MOVEMENT_TREES,
} from "./level_movement";

// NodeIds and ChoiceIds must be unique and declared ahead of time. This ensures
// that the compiler will catch any incorrect or missing references.
type NodeIds = IntroNodeIds | LevelMovementNodeIds;
type ChoiceIds = IntroChoiceIds | LevelMovementChoiceIds;

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
  ...INTRO_NODES,
  ...LEVEL_MOVEMENT_NODES,
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  ...INTRO_CHOICES,
  ...LEVEL_MOVEMENT_CHOICES,
};

export const TREES: DialogTrees = {
  ...INTRO_TREES,
  ...LEVEL_MOVEMENT_TREES,
};
