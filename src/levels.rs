// use crate::simulation::Actor;
use crate::simulation::{Fuel, Player, Pos, State};

#[derive(PartialEq, Copy, Clone, Debug)]
pub enum Outcome {
    Continue,
    Success,
    Failure,
}

type WinChecker = fn(&State) -> Outcome;

#[derive(Clone)]
pub struct Level {
    pub name: &'static str,
    pub description: &'static str,
    pub initial_code: &'static str,
    pub initial_state: State,
    // TODO(albrow): Can't use Box<dyn Actor> here because it's not
    // cloneable. Need to figure out a way to make this work later.
    // pub actors: Vec<Box<dyn Actor>>,
    pub win_checker: WinChecker,
}

// TODO(albrow): Ideally it would not be possible to call this function
// more than once (or alternatively calling it again would return the same
// result). This has proven challenging to do because of the constraints of
// WebAssembly and the presence of the Box<dyn Actor> type in the level.
pub fn get_levels() -> Vec<Level> {
    vec![Level {
        name: "Fuel Up",
        description: "Move the drone 🤖 to collect the fuel 🌟.",
        initial_code: "// This code moves the drone, but it's not going to the right place.\n// Try changing the code to see what happens?\n\nmove_right(1);\nmove_down(2);\n",
        initial_state: State {
            player: Player {
                pos: Pos { x: 0, y: 0 },
            },
            fuel: vec![Fuel {
                pos: Pos { x: 3, y: 3 },
            }],
        },
        // TODO(albrow): Do we need to use actor initializer here or offer some other
        // way to reset actor state?
        // actors: vec![],
        win_checker: |state| {
            if state.player.pos == state.fuel[0].pos {
                Outcome::Success
            } else {
                Outcome::Continue
            }
        },
    }]
}
