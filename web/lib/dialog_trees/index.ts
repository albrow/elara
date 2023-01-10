// This file contains the dialog trees used for various conversations in the game.
// The dialog trees are defined as a set of nodes (i.e. what the NPC says) and
// choices (i.e. what the player can say in response). Nodes and choices each have
// unique ids which they also use to reference each other. This allows us to create
// branching, possibly recursive dialog trees.

import * as Intro from "./intro";
import * as Movement from "./level_movement";
import * as FuelPartOne from "./level_fuel_part_one";

// NodeIds and ChoiceIds must be unique and declared ahead of time. This ensures
// that the compiler will catch any incorrect or missing references.
type NodeIds = Intro.NodeIds | Movement.NodeIds | FuelPartOne.NodeIds;
type ChoiceIds = Intro.ChoiceIds | Movement.ChoiceIds | FuelPartOne.ChoiceIds;

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
  ...Movement.NODES,
  ...FuelPartOne.NODES,
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  ...Intro.CHOICES,
  ...Movement.CHOICES,
  ...FuelPartOne.CHOICES,
};

export const TREES: DialogTrees = {
  ...Intro.TREES,
  ...Movement.TREES,
  ...FuelPartOne.TREES,
};
