mod asteroid_actor;
mod big_enemy_actor;
mod evil_rover_actor;
mod player_actor;

use crate::{
    constants::{HEIGHT, WIDTH},
    simulation::{AsteroidAnimState, Pos, State, Telepad},
};

pub use asteroid_actor::AsteroidActor;
pub use big_enemy_actor::BigEnemyActor;
pub use big_enemy_actor::BIG_ENEMY_SIZE;
pub use evil_rover_actor::EvilRoverActor;
pub use player_actor::PlayerChannelActor;

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
    PressButton,
    PickUp,
    Drop,
}

pub struct Bounds {
    pub min_x: i32,
    pub max_x: i32,
    pub min_y: i32,
    pub max_y: i32,
}

impl Bounds {
    pub fn new(min_x: i32, max_x: i32, min_y: i32, max_y: i32) -> Bounds {
        Bounds {
            min_x,
            max_x,
            min_y,
            max_y,
        }
    }

    pub fn default() -> Bounds {
        Bounds {
            min_x: 0,
            max_x: (WIDTH - 1) as i32,
            min_y: 0,
            max_y: (HEIGHT - 1) as i32,
        }
    }
}

fn is_obstacle_at(state: &State, pos: &Pos) -> bool {
    for obstacle in &state.obstacles {
        if obstacle.pos == *pos {
            return true;
        }
    }
    // Data points are treated as simple obstacles since
    // they can never move or be opened.
    for data_point in &state.data_points {
        if data_point.pos == *pos {
            return true;
        }
    }
    // Buttons can also not be moved.
    for button in &state.buttons {
        if button.pos == *pos {
            return true;
        }
    }
    // Gates and password gates are treated as obstacles only
    // if they are closed.
    for gate in &state.gates {
        if gate.pos == *pos && !gate.open {
            return true;
        }
    }
    for gate in &state.password_gates {
        if gate.pos == *pos && !gate.open {
            return true;
        }
    }
    // Unheld crates are treated as obstacles.
    for crt in &state.crates {
        if crt.pos == *pos && !crt.held {
            return true;
        }
    }
    // Asteroids are treated as obstacles, but only if they are not in the "falling" state.
    for asteroid in &state.asteroids {
        if asteroid.pos == *pos && asteroid.anim_state != AsteroidAnimState::Falling {
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

/// Returns true if the given position is a valid position for an actor to move to.
/// This applies to player and enemy actors, basically anything that moves around
/// the board.
fn can_move_to(state: &State, bounds: &Bounds, desired_pos: &Pos) -> bool {
    !is_obstacle_at(state, desired_pos) && !is_outside_bounds(bounds, desired_pos)
}

/// Returns the index of any password gates adjacent to the given position.
/// Returns an empty vector if there is no adjacent gate.
fn get_adjacent_password_gates(state: &State, pos: &Pos) -> Vec<usize> {
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
