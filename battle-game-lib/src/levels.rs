use crate::simulation::Actor;
use crate::simulation::{Fuel, Player, Pos, State};

#[derive(PartialEq, Copy, Clone, Debug)]
pub enum Outcome {
    Continue,
    Success,
    Failure,
}

pub trait Level {
    fn name(&self) -> &'static str;
    fn objective(&self) -> &'static str;
    fn initial_code(&self) -> &'static str;
    fn initial_state(&self) -> State;
    fn actors(&self) -> Vec<Box<dyn Actor>>;
    fn check_win(&self, state: &State) -> Outcome;
}

#[derive(Copy, Clone)]
pub struct Level1 {}

impl Level for Level1 {
    fn name(&self) -> &'static str {
        "Fuel Up"
    }
    fn objective(&self) -> &'static str {
        "Move the drone (🤖) to collect the fuel (⛽️)"
    }
    fn initial_code(&self) -> &'static str {
        "// This code moves the drone, but it's not going to the right place.\n// Try changing the code to see what happens?\n\nmove_right(1);\nmove_down(2);\n"
    }
    fn initial_state(&self) -> State {
        State {
            player: Player {
                pos: Pos { x: 0, y: 0 },
            },
            fuel: vec![Fuel {
                pos: Pos { x: 3, y: 3 },
            }],
        }
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        if state.player.pos == state.fuel[0].pos {
            Outcome::Success
        } else {
            Outcome::Continue
        }
    }
}

#[derive(Copy, Clone)]
pub struct Level2 {}

impl Level for Level2 {
    fn name(&self) -> &'static str {
        "Fuel Up (Part Two)"
    }
    fn objective(&self) -> &'static str {
        "Move the drone (🤖) to collect the fuel (⛽️)"
    }
    fn initial_code(&self) -> &'static str {
        "// This is level two.\n\n"
    }
    fn initial_state(&self) -> State {
        State {
            player: Player {
                pos: Pos { x: 0, y: 7 },
            },
            fuel: vec![Fuel {
                pos: Pos { x: 4, y: 2 },
            }],
        }
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        if state.player.pos == state.fuel[0].pos {
            Outcome::Success
        } else {
            Outcome::Continue
        }
    }
}

lazy_static! {
    pub static ref LEVELS: [Box<dyn Level + Sync>; 2] = [Box::new(Level1 {}), Box::new(Level2 {})];
}
