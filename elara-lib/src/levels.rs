use crate::actors::{Bounds, EnemyBugActor};
use crate::constants::{ERR_DESTROYED_BY_BUG, ERR_OUT_OF_FUEL, HEIGHT, MAX_FUEL, WIDTH};
use crate::simulation::Actor;
use crate::simulation::{Enemy, FuelSpot, Goal, Obstacle, Player, Pos, State};

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

lazy_static! {
    pub static ref LEVELS: [Box<dyn Level + Sync>; 4] = [
        Box::new(Level1 {}),
        Box::new(Level2 {}),
        Box::new(Level3 {}),
        Box::new(Level4 {}),
    ];
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
        "// Every line that starts with two slashes \"//\" is called a\n// \"comment\". Comments don't affect the drone at all; they are\n// just little notes to help you understand the code. You can\n// add your own comments too!\n//\n// The code below moves the drone, but it's not going to the right\n// place. Try changing the code to see what happens.\n\nmove_right(1);\nmove_down(2);\n"
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
            enemies: vec![],
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
        if state.player.pos == state.goal.pos {
            Outcome::Success
        } else if state.player.fuel == 0 {
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
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
            enemies: vec![],
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
        if state.player.pos == state.goal.pos {
            Outcome::Success
        } else if state.player.fuel == 0 {
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        } else {
            Outcome::Continue
        }
    }
}

#[derive(Copy, Clone)]
pub struct Level3 {}

impl Level for Level3 {
    fn name(&self) -> &'static str {
        "Loop the loop"
    }
    fn objective(&self) -> &'static str {
        "Move the drone (🤖) to the goal (🏁) using a loop."
    }
    fn initial_code(&self) -> &'static str {
        "// You can use the \"loop\" keyword to perform repeated actions.\n// Everything inside the curly braces \"{\" and \"}\" will be\n// repeated.\n\nloop {\n  move_right(1);\n  // Add a line of code here.\n}\n"
    }
    fn initial_state(&self) -> State {
        State {
            player: Player {
                pos: Pos { x: 0, y: 7 },
                fuel: 5,
            },
            fuel_spots: vec![FuelSpot::new(3, 5)],
            goal: Goal {
                pos: Pos::new(8, 0),
            },
            enemies: vec![],
            obstacles: vec![
                Obstacle::new(0, 6),
                Obstacle::new(0, 5),
                Obstacle::new(1, 5),
                Obstacle::new(1, 4),
                Obstacle::new(2, 4),
                Obstacle::new(2, 3),
                Obstacle::new(3, 3),
                Obstacle::new(3, 2),
                Obstacle::new(4, 2),
                Obstacle::new(4, 1),
                Obstacle::new(5, 1),
                Obstacle::new(5, 0),
                Obstacle::new(6, 0),
                Obstacle::new(2, 7),
                Obstacle::new(3, 7),
                Obstacle::new(3, 6),
                Obstacle::new(4, 6),
                Obstacle::new(4, 5),
                Obstacle::new(5, 5),
                Obstacle::new(5, 4),
                Obstacle::new(6, 4),
                Obstacle::new(6, 3),
                Obstacle::new(7, 3),
                Obstacle::new(7, 2),
                Obstacle::new(8, 2),
                Obstacle::new(8, 1),
                Obstacle::new(9, 1),
                Obstacle::new(9, 0),
            ],
        }
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        if state.player.pos == state.goal.pos {
            Outcome::Success
        } else if state.player.fuel == 0 {
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        } else {
            Outcome::Continue
        }
    }
}

#[derive(Copy, Clone)]
pub struct Level4 {}

impl Level for Level4 {
    fn name(&self) -> &'static str {
        "What's that Buzzing Sound?"
    }
    fn objective(&self) -> &'static str {
        "Move the drone (🤖) to the goal (🏁), but watch out for bugs (🪲)!"
    }
    fn initial_code(&self) -> &'static str {
        "// If you try going straight for the goal, you might run\n// into trouble. Can you find a different path?\n\nmove_left(2);\nmove_down(5);\n"
    }
    fn initial_state(&self) -> State {
        State {
            player: Player {
                pos: Pos { x: 11, y: 0 },
                fuel: 8,
            },
            fuel_spots: vec![
                FuelSpot {
                    pos: Pos { x: 4, y: 1 },
                    collected: false,
                },
                FuelSpot {
                    pos: Pos { x: 0, y: 5 },
                    collected: false,
                },
            ],
            goal: Goal {
                pos: Pos { x: 9, y: 5 },
            },
            enemies: vec![Enemy {
                pos: Pos { x: 9, y: 7 },
            }],
            obstacles: vec![
                Obstacle {
                    pos: Pos { x: 8, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 8, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 8, y: 3 },
                },
                Obstacle {
                    pos: Pos { x: 8, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 7, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 6, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 8, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 7, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 6, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 4, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 3, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 7, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 6, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 4, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 3, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 2, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 4, y: 4 },
                },
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
                    pos: Pos { x: 1, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 1, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 1, y: 7 },
                },
                Obstacle {
                    pos: Pos { x: 10, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 10, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 10, y: 3 },
                },
                Obstacle {
                    pos: Pos { x: 10, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 10, y: 5 },
                },
                Obstacle {
                    pos: Pos { x: 10, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 2, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 3, y: 4 },
                },
                Obstacle {
                    pos: Pos { x: 2, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 6 },
                },
                Obstacle {
                    pos: Pos { x: 11, y: 1 },
                },
                Obstacle {
                    pos: Pos { x: 3, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 5, y: 2 },
                },
                Obstacle {
                    pos: Pos { x: 8, y: 7 },
                },
                Obstacle {
                    pos: Pos { x: 10, y: 7 },
                },
            ],
        }
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(EnemyBugActor::new(
            0,
            Bounds {
                max_x: WIDTH - 1,
                max_y: HEIGHT - 1,
            },
        ))]
    }
    fn check_win(&self, state: &State) -> Outcome {
        if state.player.pos == state.goal.pos {
            Outcome::Success
        } else if is_destroyed_by_enemy(state) {
            Outcome::Failure(ERR_DESTROYED_BY_BUG.to_string())
        } else if state.player.fuel == 0 {
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        } else {
            Outcome::Continue
        }
    }
}

fn is_destroyed_by_enemy(state: &State) -> bool {
    state
        .enemies
        .iter()
        .any(|enemy| enemy.pos == state.player.pos)
}
