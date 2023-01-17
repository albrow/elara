use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;

use crate::constants::FUEL_SPOT_AMOUNT;
use crate::simulation::{
    get_adjacent_terminal, Actor, EnemyAnimState, PlayerAnimState, Pos, State,
};

pub enum Action {
    Wait,
    Move(Direction),
    Say(String),
    ReadData,
}

pub struct Bounds {
    pub min_x: i32,
    pub max_x: i32,
    pub min_y: i32,
    pub max_y: i32,
}

pub enum Direction {
    Up,
    Down,
    Left,
    Right,
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
                // Update the position and animation state. Note that the player may not
                // be able to actually move if there are obstacles in the way.
                let (new_pos, new_anim_state) = self.get_new_player_pos(&state, direction);
                state.player.pos = new_pos;
                state.player.anim_state = new_anim_state;
            }
            Ok(Action::Say(message)) => {
                // If we're next to a password gate and we said the password, toggle the gate.
                if let Some(gate_index) = get_adjacent_gate(&state, &state.player.pos) {
                    let gate = &state.password_gates[gate_index];
                    if message == gate.password {
                        state.password_gates[gate_index].open = !gate.open;
                    }
                }

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
    fn get_new_player_pos(&self, state: &State, direction: Direction) -> (Pos, PlayerAnimState) {
        let desired_pos = match direction {
            Direction::Up => Pos::new(state.player.pos.x, state.player.pos.y - 1),
            Direction::Down => Pos::new(state.player.pos.x, state.player.pos.y + 1),
            Direction::Left => Pos::new(state.player.pos.x - 1, state.player.pos.y),
            Direction::Right => Pos::new(state.player.pos.x + 1, state.player.pos.y),
        };
        if is_obstacle_at(state, &desired_pos)
            || is_outside_bounds(&self.bounds, &desired_pos)
            || is_closed_gate_at(state, &desired_pos)
        {
            // TODO(albrow): Use a different animation state to indicate that the player
            // is trying to move but can't.
            (state.player.pos.clone(), PlayerAnimState::Idle)
        } else {
            let anim_state = match direction {
                Direction::Up => PlayerAnimState::MoveUp,
                Direction::Down => PlayerAnimState::MoveDown,
                Direction::Left => PlayerAnimState::MoveLeft,
                Direction::Right => PlayerAnimState::MoveRight,
            };
            (desired_pos, anim_state)
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

impl EnemyBugActor {
    pub fn new(index: usize, bounds: Bounds) -> EnemyBugActor {
        EnemyBugActor { index, bounds }
    }

    pub fn closer_pos_x(&self, enemy_pos: &Pos, player_pos: &Pos) -> Pos {
        if player_pos.x > enemy_pos.x {
            Pos::new(enemy_pos.x + 1, enemy_pos.y)
        } else if player_pos.x < enemy_pos.x {
            Pos::new(enemy_pos.x - 1, enemy_pos.y)
        } else {
            enemy_pos.clone()
        }
    }

    pub fn closer_pos_y(&self, enemy_pos: &Pos, player_pos: &Pos) -> Pos {
        if player_pos.y > enemy_pos.y {
            Pos::new(enemy_pos.x, enemy_pos.y + 1)
        } else if player_pos.y < enemy_pos.y {
            Pos::new(enemy_pos.x, enemy_pos.y - 1)
        } else {
            enemy_pos.clone()
        }
    }
}

impl Actor for EnemyBugActor {
    fn apply(&mut self, state: State) -> State {
        let mut state = state.clone();

        // Default to Idle state.
        state.enemies[self.index].anim_state = EnemyAnimState::Idle;

        let player_pos = &state.player.pos;
        let enemy_pos = &state.enemies[self.index].pos;

        // Create an array of possible new positions for the enemy.
        // Prioritize moving in the axis in which the player is the furthest away.
        let x_dist = player_pos.x.abs_diff(enemy_pos.x);
        let y_dist = player_pos.y.abs_diff(enemy_pos.y);
        let mut possible_positions = vec![];
        if x_dist >= y_dist {
            possible_positions.push(self.closer_pos_x(enemy_pos, player_pos));
            possible_positions.push(self.closer_pos_y(enemy_pos, player_pos));
        } else {
            possible_positions.push(self.closer_pos_y(enemy_pos, player_pos));
            possible_positions.push(self.closer_pos_x(enemy_pos, player_pos));
        }

        // Iterate through possible positions and apply the first one which is unobstructed.
        for pos in possible_positions {
            if !is_obstacle_at(&state, &pos)
                && !is_outside_bounds(&self.bounds, &pos)
                && !is_closed_gate_at(&state, &pos)
            {
                state.enemies[self.index].pos = pos;
                state.enemies[self.index].anim_state = EnemyAnimState::Moving;
                break;
            }
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

fn is_outside_bounds(bounds: &Bounds, pos: &Pos) -> bool {
    pos.x > bounds.max_x || pos.y > bounds.max_y || pos.x < bounds.min_x || pos.y < bounds.min_y
}

/// Returns the index of the password gate adjacent to the given position.
/// Returns None if there is no adjacent gate.
fn get_adjacent_gate(state: &State, pos: &Pos) -> Option<usize> {
    for (i, gate) in state.password_gates.iter().enumerate() {
        if gate.pos.x == pos.x && gate.pos.y == pos.y + 1 {
            return Some(i);
        }
        if pos.y != 0 && gate.pos.x == pos.x && gate.pos.y == pos.y - 1 {
            return Some(i);
        }
        if gate.pos.x == pos.x + 1 && gate.pos.y == pos.y {
            return Some(i);
        }
        if pos.x != 0 && gate.pos.x == pos.x - 1 && gate.pos.y == pos.y {
            return Some(i);
        }
    }
    None
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{
        constants::MAX_FUEL,
        simulation::{Goal, Obstacle, PasswordGate, Player, PlayerAnimState, Pos, State},
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
        let state = State {
            player: Player::new(1, 1, MAX_FUEL),
            fuel_spots: vec![],
            obstacles: vec![],
            enemies: vec![],
            goal: None,
            password_gates: vec![],
            data_terminals: vec![],
        };

        tx.send(Action::Move(Direction::Right)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(2, 1),
                fuel: state.player.fuel - 1,
                message: String::from(""),
                anim_state: PlayerAnimState::MoveRight,
            }
        );

        tx.send(Action::Move(Direction::Left)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(0, 1),
                fuel: state.player.fuel - 1,
                message: String::from(""),
                anim_state: PlayerAnimState::MoveLeft,
            }
        );

        tx.send(Action::Move(Direction::Up)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(1, 0),
                fuel: state.player.fuel - 1,
                message: String::from(""),
                anim_state: PlayerAnimState::MoveUp,
            }
        );

        tx.send(Action::Move(Direction::Down)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(1, 2),
                fuel: state.player.fuel - 1,
                message: String::from(""),
                anim_state: PlayerAnimState::MoveDown,
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
        let state = State {
            player: Player::new(1, 1, MAX_FUEL),
            fuel_spots: vec![],
            obstacles: vec![],
            enemies: vec![],
            goal: Some(Goal {
                pos: Pos::new(3, 3),
            }),
            password_gates: vec![],
            data_terminals: vec![],
        };

        // Simple case where no obstacles are in the way and we are not
        // outside the bounds.
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Up).0,
            Pos::new(1, 0)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Down).0,
            Pos::new(1, 2)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Left).0,
            Pos::new(0, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Right).0,
            Pos::new(2, 1)
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
        let mut state = State {
            player: Player::new(1, 1, MAX_FUEL),
            fuel_spots: vec![],
            obstacles: vec![],
            enemies: vec![],
            goal: Some(Goal {
                pos: Pos::new(3, 3),
            }),
            password_gates: vec![],
            data_terminals: vec![],
        };

        // We can't move outside the bounds.
        state.player.pos = Pos::new(0, 0);
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Up).0,
            Pos::new(0, 0)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Left).0,
            Pos::new(0, 0)
        );
        state.player.pos = Pos::new(2, 2);
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Down).0,
            Pos::new(2, 2)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Right).0,
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
        let state = State {
            player: Player::new(1, 1, MAX_FUEL),
            fuel_spots: vec![],
            obstacles: vec![
                Obstacle::new(0, 0),
                Obstacle::new(1, 0),
                Obstacle::new(2, 0),
                Obstacle::new(2, 1),
                Obstacle::new(2, 2),
                Obstacle::new(1, 2),
                Obstacle::new(0, 2),
                Obstacle::new(0, 1),
            ],
            enemies: vec![],
            goal: Some(Goal {
                pos: Pos::new(3, 3),
            }),
            password_gates: vec![],
            data_terminals: vec![],
        };

        // We can't move past obstacles.
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Up).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Left).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Down).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Right).0,
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
        let state = State {
            player: Player::new(1, 1, MAX_FUEL),
            fuel_spots: vec![],
            obstacles: vec![],
            enemies: vec![],
            goal: Some(Goal {
                pos: Pos::new(3, 3),
            }),
            password_gates: vec![
                PasswordGate::new(0, 0, "lovelace".to_string(), false),
                PasswordGate::new(1, 0, "lovelace".to_string(), false),
                PasswordGate::new(2, 0, "lovelace".to_string(), false),
                PasswordGate::new(2, 1, "lovelace".to_string(), false),
                PasswordGate::new(2, 2, "lovelace".to_string(), false),
                PasswordGate::new(1, 2, "lovelace".to_string(), false),
                PasswordGate::new(0, 2, "lovelace".to_string(), false),
                PasswordGate::new(0, 1, "lovelace".to_string(), false),
            ],
            data_terminals: vec![],
        };

        // We can't move past closed gates.
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Up).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Left).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Down).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Right).0,
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
        let state = State {
            player: Player::new(1, 1, MAX_FUEL),
            fuel_spots: vec![],
            obstacles: vec![],
            enemies: vec![],
            goal: Some(Goal {
                pos: Pos::new(3, 3),
            }),
            password_gates: vec![
                PasswordGate::new(0, 0, "lovelace".to_string(), true),
                PasswordGate::new(1, 0, "lovelace".to_string(), true),
                PasswordGate::new(2, 0, "lovelace".to_string(), true),
                PasswordGate::new(2, 1, "lovelace".to_string(), true),
                PasswordGate::new(2, 2, "lovelace".to_string(), true),
                PasswordGate::new(1, 2, "lovelace".to_string(), true),
                PasswordGate::new(0, 2, "lovelace".to_string(), true),
                PasswordGate::new(0, 1, "lovelace".to_string(), true),
            ],
            data_terminals: vec![],
        };

        // We *can* move past open gates.
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Up).0,
            Pos::new(1, 0)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Down).0,
            Pos::new(1, 2)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Left).0,
            Pos::new(0, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Right).0,
            Pos::new(2, 1)
        );
    }

    // TODO(albrow): Add tests for EnemyBugActor.
}
