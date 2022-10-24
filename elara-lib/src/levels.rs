use crate::constants::{ERR_OUT_OF_FUEL, MAX_FUEL};
use crate::simulation::Actor;
use crate::simulation::{FuelSpot, Goal, Obstacle, Player, Pos, State};

#[derive(PartialEq, Clone, Debug)]
pub enum Outcome {
    Continue,
    Success,
    Failure(String),
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
        "First Steps"
    }
    fn objective(&self) -> &'static str {
        "Move the drone (🤖) to the goal (🏁)."
    }
    fn initial_code(&self) -> &'static str {
        "// This code moves the drone, but it's not going to the right place.\n// Try changing the code to see what happens?\n\nmove_right(1);\nmove_down(2);\n"
    }
    fn initial_state(&self) -> State {
        State {
            player: Player {
                pos: Pos { x: 0, y: 0 },
                fuel: MAX_FUEL,
            },
            fuel_spots: vec![],
            goal: Goal {
                pos: Pos { x: 3, y: 3 },
            },
            obstacles: vec![
                // Obstacles enclose the player and goal in a 4x4 square.
                Obstacle {
                    pos: Pos { x: 4, y: 0 },
                },
                Obstacle {
                    pos: Pos { x: 4, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 4, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 4, y: 3 },
                },
                Obstacle {
                    pos: Pos { x: 4, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 0, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 1, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 2, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 3, y: 4 },
                },
            ],
        }
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        if state.player.fuel == 0 {
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        } else if state.player.pos == state.goal.pos {
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
        "Fuel Up"
    }
    fn objective(&self) -> &'static str {
        "First move the drone (🤖) to collect the fuel (⛽️), then move to the goal (🏁)."
    }
    fn initial_code(&self) -> &'static str {
        "// If you try moving straight to the goal, you'll run out of fuel\n// first. Try collecting some fuel before moving to the goal.\n\nmove_down(4);\nmove_right(4);\n"
    }
    fn initial_state(&self) -> State {
        State {
            player: Player {
                pos: Pos { x: 0, y: 0 },
                fuel: 5,
            },
            fuel_spots: vec![FuelSpot {
                pos: Pos { x: 0, y: 5 },
                collected: false,
            }],
            goal: Goal {
                pos: Pos::new(4, 4),
            },
            obstacles: vec![
                // Obstacles enclose the player, goal, and fuel with a few different
                // branching paths.
                Obstacle {
                    pos: Pos { x: 1, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 1, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 1, y: 3 },
                },
                Obstacle {
                    pos: Pos { x: 2, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 2, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 2, y: 3 },
                },
                Obstacle {
                    pos: Pos { x: 3, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 3, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 3, y: 3 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 0 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 3 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 5 },
                },
                Obstacle {
                    pos: Pos { x: 4, y: 5 },
                },
                Obstacle {
                    pos: Pos { x: 3, y: 5 },
                },
                Obstacle {
                    pos: Pos { x: 2, y: 5 },
                },
                Obstacle {
                    pos: Pos { x: 1, y: 5 },
                },
                Obstacle {
                    pos: Pos { x: 1, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 1, y: 7 },
                },
            ],
        }
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        if state.player.fuel == 0 {
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        } else if state.player.pos == state.goal.pos {
            Outcome::Success
        } else {
            Outcome::Continue
        }
    }
}

lazy_static! {
    pub static ref LEVELS: [Box<dyn Level + Sync>; 2] = [Box::new(Level1 {}), Box::new(Level2 {})];
}
