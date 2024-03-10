use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;

use crate::constants::ENERGY_CELL_AMOUNT;
use crate::simulation::{
    get_adjacent_button, get_adjacent_point, get_crate_in_front, Actor, BumpAnimData,
    ButtonConnection, Orientation, PlayerAnimState, Pos, State, TeleAnimData,
};

use super::{
    can_move_to, get_adjacent_password_gates, get_telepad_at, Action, Bounds, MoveDirection,
    TurnDirection,
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

        // Reset the reading state of all data points.
        for d_point in state.data_points.iter_mut() {
            d_point.reading = false;
        }

        // Reset the pressed state of all buttons.
        for button in state.buttons.iter_mut() {
            button.currently_pressed = false;
        }

        // Reset the "wrong password" state of all password gates.
        for gate in state.password_gates.iter_mut() {
            gate.wrong_password = false;
        }

        let rx = self.rx.clone();
        match rx.borrow().try_recv() {
            Ok(Action::Wait) => {}
            Ok(Action::Move(direction)) => {
                // We can't move if we're out of energy.
                if state.player.energy == 0 {
                    return state;
                }

                // Moving in any direction costs one energy.
                state.player.energy -= 1;
                state.player.total_energy_used += 1;
                // Update the position and animation state. Note that the player may not
                // be able to actually move if there are obstacles in the way.
                let (new_pos, new_facing, new_anim_state) = self.try_to_move(&state, direction);
                state.player.pos = new_pos;
                state.player.facing = new_facing;
                state.player.anim_state = new_anim_state;

                // If the player is holding a crate, move the crate too.
                if let Some(crate_index) = state.player.held_crate_index {
                    state.crates[crate_index].pos = state.player.pos.clone();
                }
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
                get_adjacent_password_gates(&state, &state.player.pos)
                    .iter()
                    .for_each(|&gate_index| {
                        let gate = &state.password_gates[gate_index];
                        if message == gate.password {
                            state.password_gates[gate_index].open = !gate.open;
                        } else {
                            // Indicate that the wrong password was said.
                            state.password_gates[gate_index].wrong_password = true;
                        }
                    });

                state.player.anim_state = PlayerAnimState::Idle;
                state.player.message = message;
            }
            Ok(Action::ReadData) => {
                // If we're next to a data point, mark it as being currently read.
                // (The reading state only affects the UI).
                if let Some(d_point_index) = get_adjacent_point(&state, &state.player.pos) {
                    state.data_points[d_point_index].reading = true;
                }
                state.player.anim_state = PlayerAnimState::Idle;
            }
            Ok(Action::PressButton) => {
                if let Some(button_index) = get_adjacent_button(&state, &state.player.pos) {
                    self.handle_button_press(&mut state, button_index);
                }
                state.player.anim_state = PlayerAnimState::Idle;
            }
            Ok(Action::PickUp) => {
                // If the player is already holding a crate, don't do anything.
                if state
                    .crates
                    .iter()
                    .any(|c| c.pos == state.player.pos && c.held)
                {
                    return state;
                }

                // If there is a crate in front of the player, pick it up.
                if let Some(crate_index) = get_crate_in_front(&state) {
                    state.player.anim_state = PlayerAnimState::PickingUp;
                    state.crates[crate_index].held = true;
                    state.crates[crate_index].pos = state.player.pos.clone();
                    state.player.held_crate_index = Some(crate_index);
                }
            }
            Ok(Action::Drop) => {
                // If the player is holding a crate, drop it and set its position
                // to directly in front of the player.
                for crt in state.crates.iter_mut() {
                    if crt.pos == state.player.pos && crt.held {
                        state.player.anim_state = PlayerAnimState::Dropping;
                        crt.held = false;
                        match state.player.facing {
                            Orientation::Up => crt.pos.y -= 1,
                            Orientation::Down => crt.pos.y += 1,
                            Orientation::Left => crt.pos.x -= 1,
                            Orientation::Right => crt.pos.x += 1,
                        }
                        state.player.held_crate_index = None;
                    }
                }
            }
            Err(_) => {}
        }

        // If we're on a energy cell *after moving*, increase our current energy
        // and mark the energy cell as collected.
        for (i, energy_cell) in state.energy_cells.iter().enumerate() {
            if energy_cell.pos == state.player.pos && !energy_cell.collected {
                state.player.energy += ENERGY_CELL_AMOUNT;
                state.energy_cells[i].collected = true;
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
                telepad.end_facing,
                PlayerAnimState::Teleporting(TeleAnimData {
                    start_pos: state.player.pos.clone(),
                    enter_pos: desired_pos,
                    exit_pos: telepad.end_pos.clone(),
                }),
            );
        }
        if can_move_to(state, &self.bounds, &desired_pos) {
            (desired_pos, state.player.facing, PlayerAnimState::Moving)
        } else {
            (
                state.player.pos.clone(),
                state.player.facing,
                PlayerAnimState::Bumping(BumpAnimData {
                    pos: state.player.pos.clone(),
                    obstacle_pos: desired_pos,
                }),
            )
        }
    }

    // Update the state based on a button press.
    fn handle_button_press(&self, state: &mut State, button_index: usize) {
        state.buttons[button_index].currently_pressed = true;
        let button = &state.buttons[button_index];
        match button.connection {
            ButtonConnection::None => {
                // Don't do anything.
            }
            ButtonConnection::Gate(gate_index) => {
                // Toggle the open status of the gate.
                state.gates[gate_index].open = !state.gates[gate_index].open;
            }
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{
        constants::MAX_ENERGY,
        simulation::{
            Button, Crate, CrateColor, DataPoint, Gate, GateVariant, Obstacle, PasswordGate,
            Player, PlayerAnimState, Pos, State, Telepad,
        },
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
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);

        tx.send(Action::Move(MoveDirection::Forward)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(2, 1),
                energy: state.player.energy - 1,
                message: String::from(""),
                anim_state: PlayerAnimState::Moving,
                facing: Orientation::Right,
                total_energy_used: 1,
                held_crate_index: None,
            }
        );
        state = new_state;

        tx.send(Action::Turn(TurnDirection::Right)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(2, 1),
                energy: state.player.energy,
                message: String::from(""),
                anim_state: PlayerAnimState::Turning,
                facing: Orientation::Down,
                total_energy_used: 1,
                held_crate_index: None,
            }
        );
        state = new_state;

        tx.send(Action::Move(MoveDirection::Forward)).unwrap();
        let new_state = actor.apply(state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(2, 2),
                energy: state.player.energy - 1,
                message: String::from(""),
                anim_state: PlayerAnimState::Moving,
                facing: Orientation::Down,
                total_energy_used: 2,
                held_crate_index: None,
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
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);

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
    fn try_to_move_through_bounds() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 2,
            min_y: 0,
            max_y: 2,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);

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
    fn try_to_move_through_obstacles() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
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

    /// Helper function that asserts that the player can move in any direction.
    fn assert_player_can_move_in_any_direction(state: &mut State, actor: &PlayerChannelActor) {
        state.player.facing = Orientation::Up;
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Forward).0,
            Pos::new(1, 0)
        );
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Backward).0,
            Pos::new(1, 2)
        );
        state.player.facing = Orientation::Down;
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Forward).0,
            Pos::new(1, 2)
        );
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Backward).0,
            Pos::new(1, 0)
        );
        state.player.facing = Orientation::Left;
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Forward).0,
            Pos::new(0, 1)
        );
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Backward).0,
            Pos::new(2, 1)
        );
        state.player.facing = Orientation::Right;
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Forward).0,
            Pos::new(2, 1)
        );
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Backward).0,
            Pos::new(0, 1)
        );
    }

    /// Helper function that asserts the player *cannot* move in any direction.
    fn assert_player_cannot_move_in_any_direction(state: &mut State, actor: &PlayerChannelActor) {
        state.player.facing = Orientation::Up;
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
        state.player.facing = Orientation::Down;
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
        state.player.facing = Orientation::Left;
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
        state.player.facing = Orientation::Right;
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Forward).0,
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.try_to_move(state, MoveDirection::Backward).0,
            Pos::new(1, 1)
        );
    }

    #[test]
    fn try_to_move_through_closed_gates() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.gates = vec![
            Gate::new(0, 0, false, GateVariant::NESW),
            Gate::new(1, 0, false, GateVariant::NESW),
            Gate::new(2, 0, false, GateVariant::NESW),
            Gate::new(2, 1, false, GateVariant::NESW),
            Gate::new(2, 2, false, GateVariant::NESW),
            Gate::new(1, 2, false, GateVariant::NESW),
            Gate::new(0, 2, false, GateVariant::NESW),
            Gate::new(0, 1, false, GateVariant::NESW),
        ];

        // We should not be able to move past closed gates.
        assert_player_cannot_move_in_any_direction(&mut state, &actor)
    }

    #[test]
    fn try_to_move_through_open_gates() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.gates = vec![
            Gate::new(0, 0, true, GateVariant::NWSE),
            Gate::new(1, 0, true, GateVariant::NESW),
            Gate::new(2, 0, true, GateVariant::NWSE),
            Gate::new(2, 1, true, GateVariant::NESW),
            Gate::new(2, 2, true, GateVariant::NWSE),
            Gate::new(1, 2, true, GateVariant::NESW),
            Gate::new(0, 2, true, GateVariant::NWSE),
            Gate::new(0, 1, true, GateVariant::NESW),
        ];

        // We should be able to move past open gates.
        assert_player_can_move_in_any_direction(&mut state, &actor)
    }

    #[test]
    fn try_to_move_through_closed_password_gates() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.password_gates = vec![
            PasswordGate::new(0, 0, "lovelace".to_string(), false, GateVariant::NESW),
            PasswordGate::new(1, 0, "lovelace".to_string(), false, GateVariant::NESW),
            PasswordGate::new(2, 0, "lovelace".to_string(), false, GateVariant::NESW),
            PasswordGate::new(2, 1, "lovelace".to_string(), false, GateVariant::NESW),
            PasswordGate::new(2, 2, "lovelace".to_string(), false, GateVariant::NESW),
            PasswordGate::new(1, 2, "lovelace".to_string(), false, GateVariant::NESW),
            PasswordGate::new(0, 2, "lovelace".to_string(), false, GateVariant::NESW),
            PasswordGate::new(0, 1, "lovelace".to_string(), false, GateVariant::NESW),
        ];

        // We can't move past closed password gates.
        assert_player_cannot_move_in_any_direction(&mut state, &actor)
    }

    #[test]
    fn try_to_move_through_open_password_gates() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.password_gates = vec![
            PasswordGate::new(0, 0, "lovelace".to_string(), true, GateVariant::NWSE),
            PasswordGate::new(1, 0, "lovelace".to_string(), true, GateVariant::NESW),
            PasswordGate::new(2, 0, "lovelace".to_string(), true, GateVariant::NWSE),
            PasswordGate::new(2, 1, "lovelace".to_string(), true, GateVariant::NESW),
            PasswordGate::new(2, 2, "lovelace".to_string(), true, GateVariant::NWSE),
            PasswordGate::new(1, 2, "lovelace".to_string(), true, GateVariant::NESW),
            PasswordGate::new(0, 2, "lovelace".to_string(), true, GateVariant::NWSE),
            PasswordGate::new(0, 1, "lovelace".to_string(), true, GateVariant::NESW),
        ];

        // We *can* move past open password gates.
        assert_player_can_move_in_any_direction(&mut state, &actor)
    }

    #[test]
    fn try_to_move_through_buttons() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.buttons = vec![
            Button::new(0, 0, ButtonConnection::None),
            Button::new(1, 0, ButtonConnection::None),
            Button::new(2, 0, ButtonConnection::None),
            Button::new(2, 1, ButtonConnection::None),
            Button::new(2, 2, ButtonConnection::None),
            Button::new(1, 2, ButtonConnection::None),
            Button::new(0, 2, ButtonConnection::None),
            Button::new(0, 1, ButtonConnection::None),
        ];
        assert_player_cannot_move_in_any_direction(&mut state, &actor)
    }

    #[test]
    fn try_to_move_through_data_points() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.data_points = vec![
            DataPoint::new(0, 0, "apples".into()),
            DataPoint::new(1, 0, "apples".into()),
            DataPoint::new(2, 0, "apples".into()),
            DataPoint::new(2, 1, "apples".into()),
            DataPoint::new(2, 2, "apples".into()),
            DataPoint::new(1, 2, "apples".into()),
            DataPoint::new(0, 2, "apples".into()),
            DataPoint::new(0, 1, "apples".into()),
        ];
        assert_player_cannot_move_in_any_direction(&mut state, &actor)
    }

    #[test]
    fn try_to_move_through_crates() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.crates = vec![
            Crate::new(0, 0, CrateColor::Red),
            Crate::new(1, 0, CrateColor::Red),
            Crate::new(2, 0, CrateColor::Red),
            Crate::new(2, 1, CrateColor::Red),
            Crate::new(2, 2, CrateColor::Red),
            Crate::new(1, 2, CrateColor::Red),
            Crate::new(0, 2, CrateColor::Red),
            Crate::new(0, 1, CrateColor::Red),
        ];
        assert_player_cannot_move_in_any_direction(&mut state, &actor)
    }

    #[test]
    fn try_to_move_through_telepad() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
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

    #[test]
    fn say_affects_password_gates() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let (tx, rx) = mpsc::channel();
        let mut actor = PlayerChannelActor::new(Rc::new(RefCell::new(rx)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.password_gates = vec![PasswordGate::new(
            0,
            1,
            "password".into(),
            false,
            GateVariant::NESW,
        )];

        // Say the wrong password.
        tx.send(Action::Say("wrong password".to_string())).unwrap();
        let new_state = actor.apply(state.clone());

        // The PasswordGate should be updated to indicate the wrong password was said.
        assert_eq!(
            new_state.password_gates[0],
            PasswordGate {
                pos: Pos::new(0, 1),
                password: "password".to_string(),
                open: false,
                variant: GateVariant::NESW,
                additional_info: String::new(),
                wrong_password: true,
            }
        );

        // Take any other action (e.g. turn)
        tx.send(Action::Turn(TurnDirection::Right)).unwrap();
        let new_state = actor.apply(new_state.clone());

        // The wrong_password field should now be set to false, but the gate
        // should still be closed.
        assert_eq!(
            new_state.password_gates[0],
            PasswordGate {
                pos: Pos::new(0, 1),
                password: "password".to_string(),
                open: false,
                variant: GateVariant::NESW,
                additional_info: String::new(),
                wrong_password: false,
            }
        );

        // Say the correct password.
        tx.send(Action::Say("password".to_string())).unwrap();
        let new_state = actor.apply(new_state.clone());

        // The PasswordGate should be updated to indicate the wrong password was said.
        assert_eq!(
            new_state.password_gates[0],
            PasswordGate {
                pos: Pos::new(0, 1),
                password: "password".to_string(),
                open: true,
                variant: GateVariant::NESW,
                additional_info: String::new(),
                wrong_password: false,
            }
        );
    }

    #[test]
    fn pick_up_crate() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let (tx, rx) = mpsc::channel();
        let mut actor = PlayerChannelActor::new(Rc::new(RefCell::new(rx)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.crates = vec![Crate::new(2, 1, CrateColor::Red)];

        // Pick up the crate.
        tx.send(Action::PickUp).unwrap();
        let new_state = actor.apply(state.clone());

        // The player should now be holding the crate and the crate's position
        // should be the same as the player's.
        assert_eq!(
            new_state.crates[0],
            Crate {
                pos: Pos::new(1, 1),
                held: true,
                color: CrateColor::Red,
            }
        );
        assert_eq!(new_state.player.held_crate_index, Some(0));
        assert_eq!(new_state.player.anim_state, PlayerAnimState::PickingUp);
    }

    #[test]
    fn move_with_crate() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let (tx, rx) = mpsc::channel();
        let mut actor = PlayerChannelActor::new(Rc::new(RefCell::new(rx)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.crates = vec![Crate::new(2, 1, CrateColor::Red)];

        // Pick up the crate.
        tx.send(Action::PickUp).unwrap();
        let new_state = actor.apply(state.clone());

        // Moving the player in any direction should also move the crate.
        // First move forward.
        tx.send(Action::Move(MoveDirection::Forward)).unwrap();
        let new_state = actor.apply(new_state.clone());
        // The player and crate should have moved.
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(2, 1),
                energy: MAX_ENERGY - 1,
                message: String::from(""),
                anim_state: PlayerAnimState::Moving,
                facing: Orientation::Right,
                total_energy_used: 1,
                held_crate_index: Some(0),
            }
        );
        assert_eq!(
            new_state.crates[0],
            Crate {
                pos: Pos::new(2, 1),
                held: true,
                color: CrateColor::Red,
            }
        );

        // Then move backward and check again.
        tx.send(Action::Move(MoveDirection::Backward)).unwrap();
        let new_state = actor.apply(new_state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(1, 1),
                energy: MAX_ENERGY - 2,
                message: String::from(""),
                anim_state: PlayerAnimState::Moving,
                facing: Orientation::Right,
                total_energy_used: 2,
                held_crate_index: Some(0),
            }
        );
        assert_eq!(
            new_state.crates[0],
            Crate {
                pos: Pos::new(1, 1),
                held: true,
                color: CrateColor::Red,
            }
        );

        // Turn right and repeat the process.
        tx.send(Action::Turn(TurnDirection::Right)).unwrap();
        let new_state = actor.apply(new_state.clone());
        // First forward.
        tx.send(Action::Move(MoveDirection::Forward)).unwrap();
        let new_state = actor.apply(new_state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(1, 2),
                energy: MAX_ENERGY - 3,
                message: String::from(""),
                anim_state: PlayerAnimState::Moving,
                facing: Orientation::Down,
                total_energy_used: 3,
                held_crate_index: Some(0),
            }
        );
        assert_eq!(
            new_state.crates[0],
            Crate {
                pos: Pos::new(1, 2),
                held: true,
                color: CrateColor::Red,
            }
        );

        // Then move backward.
        tx.send(Action::Move(MoveDirection::Backward)).unwrap();
        let new_state = actor.apply(new_state.clone());
        assert_eq!(
            new_state.player,
            Player {
                pos: Pos::new(1, 1),
                energy: MAX_ENERGY - 4,
                message: String::from(""),
                anim_state: PlayerAnimState::Moving,
                facing: Orientation::Down,
                total_energy_used: 4,
                held_crate_index: Some(0),
            }
        );
        assert_eq!(
            new_state.crates[0],
            Crate {
                pos: Pos::new(1, 1),
                held: true,
                color: CrateColor::Red,
            }
        );
    }

    #[test]
    fn drop_crate() {
        let bounds = Bounds {
            min_x: 0,
            max_x: 10,
            min_y: 0,
            max_y: 10,
        };
        let (tx, rx) = mpsc::channel();
        let mut actor = PlayerChannelActor::new(Rc::new(RefCell::new(rx)), bounds);
        let mut state = State::new();
        state.player = Player::new(1, 1, MAX_ENERGY, Orientation::Right);
        state.crates = vec![Crate::new(2, 1, CrateColor::Red)];

        // Pick up the crate.
        tx.send(Action::PickUp).unwrap();
        let new_state = actor.apply(state.clone());

        // Move forward and drop the crate.
        tx.send(Action::Move(MoveDirection::Forward)).unwrap();
        let new_state = actor.apply(new_state.clone());
        tx.send(Action::Drop).unwrap();
        let new_state = actor.apply(new_state.clone());

        // The player should no longer be holding the crate and the crate's
        // position should be directly in front of the player.
        assert_eq!(new_state.player.held_crate_index, None);
        assert_eq!(new_state.player.anim_state, PlayerAnimState::Dropping);
        assert_eq!(
            new_state.crates[0],
            Crate {
                pos: Pos::new(3, 1),
                held: false,
                color: CrateColor::Red,
            }
        );

        // Pick up the crate again, turn right, then drop it.
        tx.send(Action::PickUp).unwrap();
        let new_state = actor.apply(new_state.clone());
        tx.send(Action::Turn(TurnDirection::Right)).unwrap();
        let new_state = actor.apply(new_state.clone());
        tx.send(Action::Drop).unwrap();
        let new_state = actor.apply(new_state.clone());

        // The crate should now be below the player.
        assert_eq!(new_state.player.held_crate_index, None);
        assert_eq!(
            new_state.crates[0],
            Crate {
                pos: Pos::new(2, 2),
                held: false,
                color: CrateColor::Red,
            }
        );
    }
}
