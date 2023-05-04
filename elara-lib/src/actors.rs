use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;

use crate::constants::FUEL_SPOT_AMOUNT;
use crate::simulation::{
    get_adjacent_terminal, Actor, EnemyAnimState, Orientation, PlayerAnimState, Pos, State,
    TeleAnimData, Telepad,
};

#[derive(PartialEq, Debug)]
pub enum MoveDirection {
    Forward,
    Backward,
}

#[derive(PartialEq, Debug)]
pub enum TurnDirection {
    Right,
    Left,
}

pub enum Action {
    Wait,
    Move(MoveDirection),
    Turn(TurnDirection),
    Say(String),
    ReadData,
}

pub struct Bounds {
    pub min_x: i32,
    pub max_x: i32,
    pub min_y: i32,
    pub max_y: i32,
}

pub struct PlayerChannelActor {
    rx: Rc<RefCell<mpsc::Receiver<Action>>>,
    bounds: Bounds,
}

impl PlayerChannelActor {
    pub fn new(rx: Rc<RefCell<mpsc::Receiver<Action>>>, bounds: Bounds) -> PlayerChannelActor {
        PlayerChannelActor { rx, bounds }
    }

    pub fn set_bounds(&mut self, bounds: Bounds) {
        self.bounds = bounds;
    }
}

impl Actor for PlayerChannelActor {
    fn apply(&mut self, state: State) -> State {
        let mut state = state.clone();

        // Reset the player message every time an action is taken.
        // We only want messages to persist for one step.
        state.player.message = String::new();

        // Reset the reading state of all data terminals.
        for terminal in state.data_terminals.iter_mut() {
            terminal.reading = false;
        }

        let rx = self.rx.clone();
        match rx.borrow().try_recv() {
            Ok(Action::Wait) => {}
            Ok(Action::Move(direction)) => {
                // We can't move if we're out of fuel.
                if state.player.fuel == 0 {
                    return state;
                }

                // Moving in any direction costs one fuel.
                state.player.fuel -= 1;
                state.player.total_fuel_used += 1;
                // Update the position and animation state. Note that the player may not
                // be able to actually move if there are obstacles in the way.
                let (new_pos, new_facing, new_anim_state) = self.try_to_move(&state, direction);
                state.player.pos = new_pos;
                state.player.facing = new_facing;
                state.player.anim_state = new_anim_state;
            }
            Ok(Action::Turn(direction)) => {
                state.player.anim_state = PlayerAnimState::Turning;
                if direction == TurnDirection::Right {
                    state.player.facing = match state.player.facing {
                        Orientation::Up => Orientation::Right,
                        Orientation::Right => Orientation::Down,
                        Orientation::Down => Orientation::Left,
                        Orientation::Left => Orientation::Up,
                    };
                } else {
                    state.player.facing = match state.player.facing {
                        Orientation::Up => Orientation::Left,
                        Orientation::Right => Orientation::Up,
                        Orientation::Down => Orientation::Right,
                        Orientation::Left => Orientation::Down,
                    };
                }
            }
            Ok(Action::Say(message)) => {
                // If we're next to any password gates and we said the password, toggle the gate.
                get_adjacent_gates(&state, &state.player.pos)
                    .iter()
                    .for_each(|&gate_index| {
                        let gate = &state.password_gates[gate_index];
                        if message == gate.password {
                            state.password_gates[gate_index].open = !gate.open;
                        }
                    });

                state.player.message = message;
            }
            Ok(Action::ReadData) => {
                // If we're next to a data terminal, mark it as being currently read.
                // (The reading state only affects the UI).
                if let Some(terminal_index) = get_adjacent_terminal(&state, &state.player.pos) {
                    state.data_terminals[terminal_index].reading = true;
                }
            }
            Err(_) => {}
        }

        // If we're on a fuel spot *after moving*, increase our current fuel
        // and mark the fuel spot as collected.
        for (i, fuel_spot) in state.fuel_spots.iter().enumerate() {
            if fuel_spot.pos == state.player.pos && !fuel_spot.collected {
                state.player.fuel += FUEL_SPOT_AMOUNT;
                state.fuel_spots[i].collected = true;
                break;
            }
        }

        state
    }
}

impl PlayerChannelActor {
    /// First checks if we can move in the desired direction, and if so, returns the
    /// new position. Otherwise, returns the current position.
    fn try_to_move(
        &self,
        state: &State,
        direction: MoveDirection,
    ) -> (Pos, Orientation, PlayerAnimState) {
        let delta = match direction {
            MoveDirection::Forward => 1,
            MoveDirection::Backward => -1,
        };
        let desired_pos = match state.player.facing {
            Orientation::Up => Pos::new(state.player.pos.x, state.player.pos.y - delta),
            Orientation::Down => Pos::new(state.player.pos.x, state.player.pos.y + delta),
            Orientation::Left => Pos::new(state.player.pos.x - delta, state.player.pos.y),
            Orientation::Right => Pos::new(state.player.pos.x + delta, state.player.pos.y),
        };
        if let Some(telepad) = get_telepad_at(state, &desired_pos) {
            return (
                telepad.end_pos.clone(),
                telepad.end_facing.clone(),
                PlayerAnimState::Teleporting(TeleAnimData {
                    start_pos: state.player.pos.clone(),
                    enter_pos: desired_pos,
                    exit_pos: telepad.end_pos.clone(),
                }),
            );
        }
        if is_obstacle_at(state, &desired_pos)
            || is_outside_bounds(&self.bounds, &desired_pos)
            || is_closed_gate_at(state, &desired_pos)
        {
            // TODO(albrow): Use a different animation state to indicate that the player
            // is trying to move but can't. E.g., a bumping animation.
            (
                state.player.pos.clone(),
                state.player.facing.clone(),
                PlayerAnimState::Idle,
            )
        } else {
            (
                desired_pos,
                state.player.facing.clone(),
                PlayerAnimState::Moving,
            )
        }
    }
}

/// A simple actor for "bug" enemies which always try to move closer to
/// the player and do not do any path finding.
pub struct EnemyBugActor {
    /// The index in State.enemies of the enemy which will be controlled by
    /// this actor.
    index: usize,
    bounds: Bounds,
}

#[derive(Debug)]
enum EnemyBugAction {
    Move(MoveDirection),
    Turn(TurnDirection),
}

impl EnemyBugActor {
    pub fn new(index: usize, bounds: Bounds) -> EnemyBugActor {
        EnemyBugActor { index, bounds }
    }

    pub fn can_move(&self, state: &State, direction: Orientation) -> bool {
        let enemy = &state.enemies[self.index];
        let desired_pos = match direction {
            Orientation::Up => Pos::new(enemy.pos.x, enemy.pos.y - 1),
            Orientation::Down => Pos::new(enemy.pos.x, enemy.pos.y + 1),
            Orientation::Left => Pos::new(enemy.pos.x - 1, enemy.pos.y),
            Orientation::Right => Pos::new(enemy.pos.x + 1, enemy.pos.y),
        };
        !is_obstacle_at(&state, &desired_pos)
            && !is_outside_bounds(&self.bounds, &desired_pos)
            && !is_closed_gate_at(&state, &desired_pos)
    }

    fn get_next_action(&self, state: &State) -> EnemyBugAction {
        let player_pos = &state.player.pos;
        let enemy = &state.enemies[self.index];

        // Prioritize moving in the axis in which the player is the furthest away.
        let x_dist = player_pos.x.abs_diff(enemy.pos.x);
        let y_dist = player_pos.y.abs_diff(enemy.pos.y);
        if y_dist >= x_dist {
            if player_pos.y < enemy.pos.y {
                if self.can_move(state, Orientation::Up) {
                    if enemy.facing != Orientation::Up {
                        return EnemyBugAction::Turn(TurnDirection::Left);
                    }
                    return EnemyBugAction::Move(MoveDirection::Forward);
                }
            } else if player_pos.y > enemy.pos.y {
                if self.can_move(state, Orientation::Down) {
                    if enemy.facing != Orientation::Down {
                        return EnemyBugAction::Turn(TurnDirection::Left);
                    }
                    return EnemyBugAction::Move(MoveDirection::Forward);
                }
            }
            if player_pos.x < enemy.pos.x {
                if self.can_move(state, Orientation::Left) {
                    if enemy.facing != Orientation::Left {
                        return EnemyBugAction::Turn(TurnDirection::Left);
                    }
                    return EnemyBugAction::Move(MoveDirection::Forward);
                }
            } else if player_pos.x > enemy.pos.x {
                if self.can_move(state, Orientation::Right) {
                    if enemy.facing != Orientation::Right {
                        return EnemyBugAction::Turn(TurnDirection::Left);
                    }
                    return EnemyBugAction::Move(MoveDirection::Forward);
                }
            }
        } else {
            if player_pos.x < enemy.pos.x {
                if self.can_move(state, Orientation::Left) {
                    if enemy.facing != Orientation::Left {
                        return EnemyBugAction::Turn(TurnDirection::Left);
                    }
                    return EnemyBugAction::Move(MoveDirection::Forward);
                }
            } else if player_pos.x > enemy.pos.x {
                if self.can_move(state, Orientation::Right) {
                    if enemy.facing != Orientation::Right {
                        return EnemyBugAction::Turn(TurnDirection::Left);
                    }
                    return EnemyBugAction::Move(MoveDirection::Forward);
                }
            }
            if player_pos.y < enemy.pos.y {
                if self.can_move(state, Orientation::Up) {
                    if enemy.facing != Orientation::Up {
                        return EnemyBugAction::Turn(TurnDirection::Left);
                    }
                    return EnemyBugAction::Move(MoveDirection::Forward);
                }
            } else if player_pos.y > enemy.pos.y {
                if self.can_move(state, Orientation::Down) {
                    if enemy.facing != Orientation::Down {
                        return EnemyBugAction::Turn(TurnDirection::Left);
                    }
                    return EnemyBugAction::Move(MoveDirection::Forward);
                }
            }
        }
        return EnemyBugAction::Turn(TurnDirection::Left);
    }
}

impl Actor for EnemyBugActor {
    fn apply(&mut self, state: State) -> State {
        let mut state = state.clone();

        // Default to Idle state.
        state.enemies[self.index].anim_state = EnemyAnimState::Idle;

        // Update own state based on desired action.
        let action = self.get_next_action(&state);

        match action {
            EnemyBugAction::Move(direction) => {
                let desired_pos = match direction {
                    MoveDirection::Forward => match state.enemies[self.index].facing {
                        Orientation::Up => Pos::new(
                            state.enemies[self.index].pos.x,
                            state.enemies[self.index].pos.y - 1,
                        ),
                        Orientation::Down => Pos::new(
                            state.enemies[self.index].pos.x,
                            state.enemies[self.index].pos.y + 1,
                        ),
                        Orientation::Left => Pos::new(
                            state.enemies[self.index].pos.x - 1,
                            state.enemies[self.index].pos.y,
                        ),
                        Orientation::Right => Pos::new(
                            state.enemies[self.index].pos.x + 1,
                            state.enemies[self.index].pos.y,
                        ),
                    },
                    MoveDirection::Backward => match state.enemies[self.index].facing {
                        Orientation::Up => Pos::new(
                            state.enemies[self.index].pos.x,
                            state.enemies[self.index].pos.y + 1,
                        ),
                        Orientation::Down => Pos::new(
                            state.enemies[self.index].pos.x,
                            state.enemies[self.index].pos.y - 1,
                        ),
                        Orientation::Left => Pos::new(
                            state.enemies[self.index].pos.x + 1,
                            state.enemies[self.index].pos.y,
                        ),
                        Orientation::Right => Pos::new(
                            state.enemies[self.index].pos.x - 1,
                            state.enemies[self.index].pos.y,
                        ),
                    },
                };
                // If there is a telepad at the desired position, teleport.
                if let Some(telepad) = get_telepad_at(&state, &desired_pos) {
                    let anim_data = TeleAnimData {
                        start_pos: state.enemies[self.index].pos.clone(),
                        enter_pos: telepad.start_pos,
                        exit_pos: telepad.end_pos.clone(),
                    };
                    state.enemies[self.index].pos = telepad.end_pos.clone();
                    state.enemies[self.index].anim_state = EnemyAnimState::Teleporting(anim_data);
                    // TODO(albrow): This will make it so that enemies always face the same direction
                    // as players when going through a telepad. Is that what we want?
                    state.enemies[self.index].facing = telepad.end_facing;
                } else {
                    state.enemies[self.index].pos = desired_pos;
                    state.enemies[self.index].anim_state = EnemyAnimState::Moving;
                }
            }
            EnemyBugAction::Turn(direction) => match direction {
                TurnDirection::Left => {
                    state.enemies[self.index].anim_state = EnemyAnimState::Turning;
                    state.enemies[self.index].facing = match state.enemies[self.index].facing {
                        Orientation::Up => Orientation::Left,
                        Orientation::Down => Orientation::Right,
                        Orientation::Left => Orientation::Down,
                        Orientation::Right => Orientation::Up,
                    };
                }
                TurnDirection::Right => {
                    state.enemies[self.index].anim_state = EnemyAnimState::Turning;
                    state.enemies[self.index].facing = match state.enemies[self.index].facing {
                        Orientation::Up => Orientation::Right,
                        Orientation::Down => Orientation::Left,
                        Orientation::Left => Orientation::Up,
                        Orientation::Right => Orientation::Down,
                    };
                }
            },
        }

        state
    }
}

fn is_obstacle_at(state: &State, pos: &Pos) -> bool {
    for obstacle in &state.obstacles {
        if obstacle.pos == *pos {
            return true;
        }
    }
    // Data terminals are treated as simple obstacles since
    // they can never move or be opened.
    for data_terminal in &state.data_terminals {
        if data_terminal.pos == *pos {
            return true;
        }
    }
    false
}

fn is_closed_gate_at(state: &State, pos: &Pos) -> bool {
    for gate in &state.password_gates {
        if gate.pos == *pos && !gate.open {
            return true;
        }
    }
    false
}

fn get_telepad_at(state: &State, pos: &Pos) -> Option<Telepad> {
    for telepad in &state.telepads {
        if telepad.start_pos == *pos {
            return Some(telepad.clone());
        }
    }
    None
}

fn is_outside_bounds(bounds: &Bounds, pos: &Pos) -> bool {
    pos.x > bounds.max_x || pos.y > bounds.max_y || pos.x < bounds.min_x || pos.y < bounds.min_y
}

/// Returns the index of any password gates adjacent to the given position.
/// Returns an empty vector if there is no adjacent gate.
fn get_adjacent_gates(state: &State, pos: &Pos) -> Vec<usize> {
    let mut gate_indexes = vec![];
    for (i, gate) in state.password_gates.iter().enumerate() {
        if gate.pos.x == pos.x && gate.pos.y == pos.y + 1 {
            gate_indexes.push(i);
        }
        if pos.y != 0 && gate.pos.x == pos.x && gate.pos.y == pos.y - 1 {
            gate_indexes.push(i);
        }
        if gate.pos.x == pos.x + 1 && gate.pos.y == pos.y {
            gate_indexes.push(i);
        }
        if pos.x != 0 && gate.pos.x == pos.x - 1 && gate.pos.y == pos.y {
            gate_indexes.push(i);
        }
    }
    gate_indexes
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{
        constants::MAX_FUEL,
        simulation::{Obstacle, PasswordGate, Player, PlayerAnimState, Pos, State, Telepad},
    };

    #[test]
    fn basic_movement() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let (tx, rx) = mpsc::channel();
        let mut actor = PlayerChannelActor::new(Rc::new(RefCell::new(rx)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_FUEL, Orientation::Right);

        tx.send(Action::Move(MoveDirection::Forward)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(2, 1),
                fuel: state.player.fuel - 1,
                message: String::from(""),
                anim_state: PlayerAnimState::Moving,
                facing: Orientation::Right,
                total_fuel_used: 1,
            }
        );
        state = new_state;

        tx.send(Action::Turn(TurnDirection::Right)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(2, 1),
                fuel: state.player.fuel,
                message: String::from(""),
                anim_state: PlayerAnimState::Turning,
                facing: Orientation::Down,
                total_fuel_used: 1,
            }
        );
        state = new_state;

        tx.send(Action::Move(MoveDirection::Forward)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(2, 2),
                fuel: state.player.fuel - 1,
                message: String::from(""),
                anim_state: PlayerAnimState::Moving,
                facing: Orientation::Down,
                total_fuel_used: 2,
            }
        );
    }

    #[test]
    fn get_new_player_pos() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_FUEL, Orientation::Right);

        // Simple case where no obstacles are in the way and we are not
        // outside the bounds.
        state.player.facing = Orientation::Up;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 0)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 2)
        );
        state.player.facing = Orientation::Down;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 2)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 0)
        );
        state.player.facing = Orientation::Left;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(0, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(2, 1)
        );
        state.player.facing = Orientation::Right;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(2, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(0, 1)
        );
    }

    #[test]
    fn get_new_player_pos_with_bounds() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 2,
            min_y: 0,
            max_y: 2,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_FUEL, Orientation::Right);

        // We can't move outside the bounds.
        state.player.pos = Pos::new(0, 0);
        state.player.facing = Orientation::Up;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(0, 0)
        );
        state.player.facing = Orientation::Down;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(0, 0)
        );
        state.player.facing = Orientation::Left;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(0, 0)
        );
        state.player.facing = Orientation::Right;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(0, 0)
        );
        state.player.pos = Pos::new(2, 2);
        state.player.facing = Orientation::Down;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(2, 2)
        );
        state.player.facing = Orientation::Up;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(2, 2)
        );
        state.player.facing = Orientation::Right;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(2, 2)
        );
        state.player.facing = Orientation::Left;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(2, 2)
        );
    }

    #[test]
    fn get_new_player_pos_with_obstacles() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_FUEL, Orientation::Right);
        state.obstacles = vec![
            Obstacle::new(0, 0),
            Obstacle::new(1, 0),
            Obstacle::new(2, 0),
            Obstacle::new(2, 1),
            Obstacle::new(2, 2),
            Obstacle::new(1, 2),
            Obstacle::new(0, 2),
            Obstacle::new(0, 1),
        ];

        // We can't move past obstacles.
        state.player.facing = Orientation::Up;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
        state.player.facing = Orientation::Left;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
        state.player.facing = Orientation::Down;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
        state.player.facing = Orientation::Right;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
    }

    #[test]
    fn get_new_player_pos_with_closed_gates() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_FUEL, Orientation::Right);
        state.password_gates = vec![
            PasswordGate::new(0, 0, "lovelace".to_string(), false),
            PasswordGate::new(1, 0, "lovelace".to_string(), false),
            PasswordGate::new(2, 0, "lovelace".to_string(), false),
            PasswordGate::new(2, 1, "lovelace".to_string(), false),
            PasswordGate::new(2, 2, "lovelace".to_string(), false),
            PasswordGate::new(1, 2, "lovelace".to_string(), false),
            PasswordGate::new(0, 2, "lovelace".to_string(), false),
            PasswordGate::new(0, 1, "lovelace".to_string(), false),
        ];

        // We can't move past closed gates.
        state.player.facing = Orientation::Up;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
        state.player.facing = Orientation::Left;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
        state.player.facing = Orientation::Down;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
        state.player.facing = Orientation::Right;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
    }

    #[test]
    fn get_new_player_pos_with_open_gates() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_FUEL, Orientation::Right);
        state.password_gates = vec![
            PasswordGate::new(0, 0, "lovelace".to_string(), true),
            PasswordGate::new(1, 0, "lovelace".to_string(), true),
            PasswordGate::new(2, 0, "lovelace".to_string(), true),
            PasswordGate::new(2, 1, "lovelace".to_string(), true),
            PasswordGate::new(2, 2, "lovelace".to_string(), true),
            PasswordGate::new(1, 2, "lovelace".to_string(), true),
            PasswordGate::new(0, 2, "lovelace".to_string(), true),
            PasswordGate::new(0, 1, "lovelace".to_string(), true),
        ];

        // We *can* move past open gates.
        state.player.facing = Orientation::Up;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 0)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 2)
        );
        state.player.facing = Orientation::Down;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(1, 2)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(1, 0)
        );
        state.player.facing = Orientation::Left;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(0, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(2, 1)
        );
        state.player.facing = Orientation::Right;
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward).0,
            Pos::new(2, 1)
        );
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Backward).0,
            Pos::new(0, 1)
        );
    }

    #[test]
    fn get_new_player_pos_with_telepad() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_FUEL, Orientation::Right);
        state.telepads = vec![Telepad::new((2, 1), (4, 4), Orientation::Left)];

        // Should teleport to end_pos and be facing the new direction.
        assert_eq!(
            actor.try_to_move(&state, MoveDirection::Forward),
            (
                Pos::new(4, 4),
                Orientation::Left,
                PlayerAnimState::Teleporting(TeleAnimData {
                    start_pos: Pos::new(1, 1),
                    enter_pos: Pos::new(2, 1),
                    exit_pos: Pos::new(4, 4),
                })
            )
        );
    }

    // TODO(albrow): Add tests for EnemyBugActor.
}
