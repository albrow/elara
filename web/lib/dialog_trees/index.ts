// This file contains the dialog trees used for various conversations in the game.
// The dialog trees are defined as a set of nodes (i.e. what the NPC says) and
// choices (i.e. what the player can say in response). Nodes and choices each have
// unique ids which they also use to reference each other. This allows us to create
// branching, possibly recursive dialog trees.

import * as Intro from "./intro";
import * as Gates from "./level_gates";
import * as DataPointsPartOne from "./level_data_points_part_one";
import * as GateAndDataPoint from "./level_gate_and_data_point";
import * as GateAndDataPointPartThree from "./level_gate_and_data_point_part_three";
import * as AsteroidStrike from "./level_asteroid_strike";
import * as PartlyDisabledMovement from "./level_partly_disabled_movement";
import * as ReImplementTurnRight from "./level_reimplement_turn_right";
import * as LevelTelepadPartOne from "./level_telepad_part_one";
import * as LoopsPartTwo from "./level_loops_part_two";
import * as GateAndDataPointPartTwo from "./level_gate_and_data_point_part_two";
import * as EnemiesPartOne from "./level_enemies_part_one";
import * as LevelTelepadsAndWhileLoop from "./level_telepads_and_while_loop";
import * as BigEnemy from "./level_big_enemy";
import * as ServerRoom from "./level_server_room";
import * as KalinaInTrouble from "./kalina_in_trouble";
import * as ExplainJournal from "./explain_journal";
import * as ButtonAndGate from "./level_button_and_gate";
import * as CratesPartOne from "./level_crates_part_one";

// NodeIds and ChoiceIds must be unique and declared ahead of time. This ensures
// that the compiler will catch any incorrect or missing references.
type NodeIds =
  | Intro.NodeIds
  | DataPointsPartOne.NodeIds
  | Gates.NodeIds
  | GateAndDataPoint.NodeIds
  | GateAndDataPointPartThree.NodeIds
  | AsteroidStrike.NodeIds
  | PartlyDisabledMovement.NodeIds
  | ReImplementTurnRight.NodeIds
  | LevelTelepadPartOne.NodeIds
  | LoopsPartTwo.NodeIds
  | GateAndDataPointPartTwo.NodeIds
  | EnemiesPartOne.NodeIds
  | LevelTelepadsAndWhileLoop.NodeIds
  | BigEnemy.NodeIds
  | ServerRoom.NodeIds
  | KalinaInTrouble.NodeIds
  | ExplainJournal.NodeIds
  | ButtonAndGate.NodeIds
  | CratesPartOne.NodeIds;
type ChoiceIds =
  | Intro.ChoiceIds
  | DataPointsPartOne.ChoiceIds
  | Gates.ChoiceIds
  | GateAndDataPoint.ChoiceIds
  | GateAndDataPointPartThree.ChoiceIds
  | AsteroidStrike.ChoiceIds
  | PartlyDisabledMovement.ChoiceIds
  | ReImplementTurnRight.ChoiceIds
  | LevelTelepadPartOne.ChoiceIds
  | LoopsPartTwo.ChoiceIds
  | GateAndDataPointPartTwo.ChoiceIds
  | EnemiesPartOne.ChoiceIds
  | LevelTelepadsAndWhileLoop.ChoiceIds
  | BigEnemy.ChoiceIds
  | ServerRoom.ChoiceIds
  | KalinaInTrouble.ChoiceIds
  | ExplainJournal.ChoiceIds
  | ButtonAndGate.ChoiceIds
  | CratesPartOne.ChoiceIds;

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
  ...DataPointsPartOne.NODES,
  ...Gates.NODES,
  ...GateAndDataPoint.NODES,
  ...GateAndDataPointPartThree.NODES,
  ...AsteroidStrike.NODES,
  ...PartlyDisabledMovement.NODES,
  ...ReImplementTurnRight.NODES,
  ...LevelTelepadPartOne.NODES,
  ...LoopsPartTwo.NODES,
  ...GateAndDataPointPartTwo.NODES,
  ...EnemiesPartOne.NODES,
  ...LevelTelepadsAndWhileLoop.NODES,
  ...BigEnemy.NODES,
  ...ServerRoom.NODES,
  ...KalinaInTrouble.NODES,
  ...ExplainJournal.NODES,
  ...ButtonAndGate.NODES,
  ...CratesPartOne.NODES,
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  ...Intro.CHOICES,
  ...DataPointsPartOne.CHOICES,
  ...Gates.CHOICES,
  ...GateAndDataPoint.CHOICES,
  ...GateAndDataPointPartThree.CHOICES,
  ...AsteroidStrike.CHOICES,
  ...PartlyDisabledMovement.CHOICES,
  ...ReImplementTurnRight.CHOICES,
  ...LevelTelepadPartOne.CHOICES,
  ...LoopsPartTwo.CHOICES,
  ...GateAndDataPointPartTwo.CHOICES,
  ...EnemiesPartOne.CHOICES,
  ...LevelTelepadsAndWhileLoop.CHOICES,
  ...BigEnemy.CHOICES,
  ...ServerRoom.CHOICES,
  ...KalinaInTrouble.CHOICES,
  ...ExplainJournal.CHOICES,
  ...ButtonAndGate.CHOICES,
  ...CratesPartOne.CHOICES,
};

export const TREES: DialogTrees = {
  ...Intro.TREES,
  ...DataPointsPartOne.TREES,
  ...Gates.TREES,
  ...GateAndDataPoint.TREES,
  ...GateAndDataPointPartThree.TREES,
  ...AsteroidStrike.TREES,
  ...PartlyDisabledMovement.TREES,
  ...ReImplementTurnRight.TREES,
  ...LevelTelepadPartOne.TREES,
  ...LoopsPartTwo.TREES,
  ...GateAndDataPointPartTwo.TREES,
  ...EnemiesPartOne.TREES,
  ...LevelTelepadsAndWhileLoop.TREES,
  ...BigEnemy.TREES,
  ...ServerRoom.TREES,
  ...KalinaInTrouble.TREES,
  ...ExplainJournal.TREES,
  ...ButtonAndGate.TREES,
  ...CratesPartOne.TREES,
};
