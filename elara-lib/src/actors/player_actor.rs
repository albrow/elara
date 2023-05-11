use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;

use crate::constants::FUEL_SPOT_AMOUNT;
use crate::simulation::{
    get_adjacent_terminal, Actor, BumpAnimData, Orientation, PlayerAnimState, Pos, State,
    TeleAnimData,
};

use super::{
    can_move_to, get_adjacent_gates, get_telepad_at, Action, Bounds, MoveDirection, TurnDirection,
};

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

                state.player.anim_state = PlayerAnimState::Idle;
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
        if can_move_to(state, &self.bounds, &desired_pos) {
            (
                desired_pos,
                state.player.facing.clone(),
                PlayerAnimState::Moving,
            )
        } else {
            (
                state.player.pos.clone(),
                state.player.facing.clone(),
                PlayerAnimState::Bumping(BumpAnimData {
                    pos: state.player.pos.clone(),
                    obstacle_pos: desired_pos,
                }),
            )
        }
    }
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
    fn try_to_move() {
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
    fn try_to_move_with_bounds() {
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
    fn try_to_move_with_obstacles() {
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
    fn try_to_move_with_closed_gates() {
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
    fn try_to_move_with_open_gates() {
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
    fn try_to_move_with_telepad() {
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
}
