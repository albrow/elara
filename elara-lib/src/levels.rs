use crate::actors::{Bounds, EnemyBugActor};
use crate::constants::{ERR_DESTROYED_BY_BUG, ERR_OUT_OF_FUEL, HEIGHT, WIDTH};
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
    fn initial_states(&self) -> Vec<State>;
    fn actors(&self) -> Vec<Box<dyn Actor>>;
    fn check_win(&self, state: &State) -> Outcome;
    fn initial_fuzzy_state(&self) -> FuzzyState {
        FuzzyState::from(self.initial_states())
    }
}

lazy_static! {
    pub static ref LEVELS: [Box<dyn Level + Sync>; 6] = [
        Box::new(Level1 {}),
        Box::new(Level2 {}),
        Box::new(Level3 {}),
        Box::new(Level4 {}),
        Box::new(Level5 {}),
        Box::new(Level6 {}),
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
        r#"// Every line that starts with two slashes "//" is called a
// "comment". Comments don't affect the drone at all; they are
// just little notes to help you understand the code. You can
// add your own comments too!
//
// The code below moves the drone, but it's not going to the
// right place. Try changing the code to see what happens.

move_right(1);
move_down(2);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State {
            player: Player {
                pos: Pos { x: 0, y: 0 },
                fuel: 10,
            },
            fuel_spots: vec![],
            goal: Goal {
                pos: Pos { x: 3, y: 3 },
            },
            enemies: vec![],
            obstacles: vec![
                // Obstacles enclose the player and goal in a 4x4 square.
                Obstacle::new(4, 0),
                Obstacle::new(4, 1),
                Obstacle::new(4, 2),
                Obstacle::new(4, 3),
                Obstacle::new(4, 4),
                Obstacle::new(0, 4),
                Obstacle::new(1, 4),
                Obstacle::new(2, 4),
                Obstacle::new(3, 4),
            ],
        }]
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
        r#"// If you try moving straight to the goal, you'll run out of fuel
// first. Try collecting some fuel before moving to the goal.

move_down(4);
move_right(4);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State {
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
                Obstacle::new(1, 1),
                Obstacle::new(1, 2),
                Obstacle::new(1, 3),
                Obstacle::new(2, 1),
                Obstacle::new(2, 2),
                Obstacle::new(2, 3),
                Obstacle::new(3, 1),
                Obstacle::new(3, 2),
                Obstacle::new(3, 3),
                Obstacle::new(5, 0),
                Obstacle::new(5, 1),
                Obstacle::new(5, 2),
                Obstacle::new(5, 3),
                Obstacle::new(5, 4),
                Obstacle::new(5, 5),
                Obstacle::new(4, 5),
                Obstacle::new(3, 5),
                Obstacle::new(2, 5),
                Obstacle::new(1, 5),
                Obstacle::new(1, 6),
                Obstacle::new(1, 7),
            ],
        }]
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
        "Loop the Loop"
    }
    fn objective(&self) -> &'static str {
        "Move the drone (🤖) to the goal (🏁) using a loop."
    }
    fn initial_code(&self) -> &'static str {
        r#"// You can use the "loop" keyword to perform repeated actions.
// Everything inside the curly braces "{" and "}" will be
// repeated. (Don't worry, the loop will stop running if you
// run out of fuel or reach the objective).

loop {
  move_right(1);
  // Add a line of code here.

}
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State {
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
        }]
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
        r"// If you try going straight for the goal, you might run
// into trouble. Can you find a different path?

move_left(2);
move_down(5);
"
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State {
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
                Obstacle::new(8, 1),
                Obstacle::new(8, 2),
                Obstacle::new(8, 3),
                Obstacle::new(8, 4),
                Obstacle::new(7, 4),
                Obstacle::new(6, 4),
                Obstacle::new(8, 6),
                Obstacle::new(7, 6),
                Obstacle::new(6, 6),
                Obstacle::new(4, 6),
                Obstacle::new(3, 6),
                Obstacle::new(7, 1),
                Obstacle::new(6, 1),
                Obstacle::new(5, 1),
                Obstacle::new(4, 2),
                Obstacle::new(3, 1),
                Obstacle::new(2, 1),
                Obstacle::new(5, 4),
                Obstacle::new(4, 4),
                Obstacle::new(1, 1),
                Obstacle::new(1, 2),
                Obstacle::new(1, 3),
                Obstacle::new(1, 4),
                Obstacle::new(1, 6),
                Obstacle::new(1, 7),
                Obstacle::new(10, 1),
                Obstacle::new(10, 2),
                Obstacle::new(10, 3),
                Obstacle::new(10, 4),
                Obstacle::new(10, 5),
                Obstacle::new(10, 6),
                Obstacle::new(2, 4),
                Obstacle::new(3, 4),
                Obstacle::new(2, 6),
                Obstacle::new(5, 6),
                Obstacle::new(11, 1),
                Obstacle::new(3, 2),
                Obstacle::new(5, 2),
                Obstacle::new(8, 7),
                Obstacle::new(10, 7),
            ],
        }]
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

#[derive(Copy, Clone)]
pub struct Level5 {}

impl Level5 {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        return vec![
            Obstacle::new(0, 2),
            Obstacle::new(1, 2),
            Obstacle::new(2, 2),
            Obstacle::new(3, 2),
            Obstacle::new(4, 2),
            Obstacle::new(5, 2),
            Obstacle::new(6, 2),
            Obstacle::new(7, 2),
            Obstacle::new(8, 2),
            Obstacle::new(9, 2),
            Obstacle::new(10, 2),
            Obstacle::new(11, 2),
            Obstacle::new(11, 3),
            Obstacle::new(0, 4),
            Obstacle::new(1, 4),
            Obstacle::new(2, 4),
            Obstacle::new(3, 4),
            Obstacle::new(4, 4),
            Obstacle::new(5, 4),
            Obstacle::new(6, 4),
            Obstacle::new(7, 4),
            Obstacle::new(8, 4),
            Obstacle::new(9, 4),
            Obstacle::new(10, 4),
            Obstacle::new(11, 4),
        ];
    }
}

impl Level for Level5 {
    fn name(&self) -> &'static str {
        "Seeing Double"
    }
    fn objective(&self) -> &'static str {
        "Determine your position, then move the drone (🤖) to the goal (🏁)."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Hmmm.. I wasn't able to get an lock on your position,
// but I narrowed it down to two possible locations. No worries
// though! The drone has a built-in position sensor that you can
// use.

// The get_pos() function returns your current position as an
// "array". An array is just a list of values. The first value
// represents your x position and the second value represents
// your y position.
let pos = get_pos();

// An "if" statement lets you do different things depending on
// some condition.
if pos[0] == 0 {
  // The code inside the curly brace will only run if the
  // condition is true, (i.e., if your x position is equal to
  // 0).
  
} else if pos[0] == 10 {
  // This code will run if your x position is equal to 10.
  
}
"#
    }

    fn initial_states(&self) -> Vec<State> {
        vec![
            State {
                player: Player {
                    pos: Pos { x: 0, y: 3 },
                    fuel: 5,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 5, y: 3 },
                },
                enemies: vec![],
                obstacles: self.obstacles(),
            },
            State {
                player: Player {
                    pos: Pos { x: 10, y: 3 },
                    fuel: 5,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 5, y: 3 },
                },
                enemies: vec![],
                obstacles: self.obstacles(),
            },
        ]
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
pub struct Level6 {}

impl Level for Level6 {
    fn name(&self) -> &'static str {
        "Even More Trouble"
    }
    fn objective(&self) -> &'static str {
        "Determine your position, then move the drone (🤖) to the goal (🏁)."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Now the satellite is really going haywire! You could be almost
// anywhere. I think you can use the get_pos() function in
// combination with a loop to navigate to the goal, no matter where
// you are.
//
// Let's try moving closer to the goal one step at a time. The
// code below almost works, but it's not quite finished. Add
// more "else if" statements to complete the code. (Hint: We
// need to check our y position too.)
let goal = [6, 3];
loop {
  // In each iteration of the loop we check our current
  // position. Remember pos[0] represents the x coordinate
  // and pos[1] represents the y coordinate.
  let pos = get_pos();
  if pos[0] < goal[0] {
    // If our x position is less than the goal's x position,
    // we need to move right.
    move_right(1);
  } else if pos[0] > goal[0] {
    // If our x position is greater than the goal's x position,
    // we need to move left.
    move_left(1);
  } else {
    // The "break" keyword will exit the loop.
    break;
  }
}
"#
    }

    fn initial_states(&self) -> Vec<State> {
        vec![
            State {
                player: Player {
                    pos: Pos { x: 0, y: 0 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos { x: 4, y: 0 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos { x: 8, y: 0 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos { x: 0, y: 3 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos { x: 0, y: 7 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos { x: 11, y: 0 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos { x: 11, y: 4 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos { x: 11, y: 7 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos { x: 7, y: 7 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos { x: 3, y: 7 },
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos { x: 6, y: 3 },
                },
                enemies: vec![],
                obstacles: vec![],
            },
        ]
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

fn is_destroyed_by_enemy(state: &State) -> bool {
    state
        .enemies
        .iter()
        .any(|enemy| enemy.pos == state.player.pos)
}

/// A representation of multiple possible initial states in which any
/// object that could have more than one state is marked as "fuzzy".
/// When the level is loaded and the simulation is run, the "fuzziness"
/// goes away and a discrete initial state is chosen.
#[derive(PartialEq, Debug)]
pub struct FuzzyState {
    pub players: Vec<Fuzzy<Player>>,
    pub fuel_spots: Vec<Fuzzy<FuelSpot>>,
    pub goals: Vec<Fuzzy<Goal>>,
    pub enemies: Vec<Fuzzy<Enemy>>,
    pub obstacles: Vec<Fuzzy<Obstacle>>,
}

impl FuzzyState {
    pub fn from_single_state(state: &State) -> Self {
        Self {
            players: vec![Fuzzy::new(state.player.clone(), false)],
            fuel_spots: state
                .fuel_spots
                .clone()
                .into_iter()
                .map(|x| Fuzzy::new(x, false))
                .collect(),
            goals: vec![Fuzzy::new(state.goal.clone(), false)],
            enemies: state
                .enemies
                .clone()
                .into_iter()
                .map(|x| Fuzzy::new(x, false))
                .collect(),
            obstacles: state
                .obstacles
                .clone()
                .into_iter()
                .map(|x| Fuzzy::new(x, false))
                .collect(),
        }
    }

    // Given all possible initial states for a level, return a FuzzyState
    // representation in which any objects that differ between states are
    // marked as "fuzzy".
    pub fn from(possible_states: Vec<State>) -> Self {
        if possible_states.len() == 0 {
            panic!("Error computing fuzzy state: states cannot be empty");
        }

        // Start by looking at only the first possible state.
        let mut fuzzy_state = Self::from_single_state(&possible_states[0]);

        // Iterate through the remaining states (i.e. starting at index 1), and if
        // any objects differ between the first state and the current state, mark
        // them as fuzzy.
        for state in possible_states.iter().skip(1) {
            if !fuzzy_state
                .players
                .contains(&Fuzzy::new(state.player.clone(), false))
            {
                for player in fuzzy_state.players.iter_mut() {
                    player.fuzzy = true;
                }
                fuzzy_state
                    .players
                    .push(Fuzzy::new(state.player.clone(), true));
            }
            if !fuzzy_state
                .goals
                .contains(&Fuzzy::new(state.goal.clone(), false))
            {
                for goal in fuzzy_state.goals.iter_mut() {
                    goal.fuzzy = true;
                }
                fuzzy_state.goals.push(Fuzzy::new(state.goal.clone(), true));
            }

            // TODO(albrow): Support fuzziness for fuel_spots, enemies, and
            // obstacles.
        }

        fuzzy_state
    }
}

#[derive(Debug, PartialEq)]
pub struct Fuzzy<T> {
    pub obj: T,
    pub fuzzy: bool,
}

impl<T> Fuzzy<T> {
    pub fn new(obj: T, fuzzy: bool) -> Self {
        Self { obj, fuzzy }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn to_fuzzy_state() {
        // Given one possible initial state, the fuzzy state should be identical,
        // with all objects marked as non-fuzzy.
        let states = vec![State {
            player: Player {
                pos: Pos::new(0, 0),
                fuel: 10,
            },
            fuel_spots: vec![],
            goal: Goal {
                pos: Pos::new(1, 1),
            },
            enemies: vec![],
            obstacles: vec![],
        }];
        let expected = FuzzyState {
            players: vec![Fuzzy::new(
                Player {
                    pos: Pos::new(0, 0),
                    fuel: 10,
                },
                false,
            )],
            fuel_spots: vec![],
            goals: vec![Fuzzy::new(
                Goal {
                    pos: Pos::new(1, 1),
                },
                false,
            )],
            enemies: vec![],
            obstacles: vec![],
        };
        let actual = FuzzyState::from(states);
        assert_eq!(actual, expected);

        // Given two possible player positions, both should be marked as fuzzy.
        let states = vec![
            State {
                player: Player {
                    pos: Pos::new(0, 0),
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos::new(2, 2),
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos::new(1, 1),
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos::new(2, 2),
                },
                enemies: vec![],
                obstacles: vec![],
            },
        ];
        let expected = FuzzyState {
            players: vec![
                Fuzzy::new(
                    Player {
                        pos: Pos::new(0, 0),
                        fuel: 10,
                    },
                    true,
                ),
                Fuzzy::new(
                    Player {
                        pos: Pos::new(1, 1),
                        fuel: 10,
                    },
                    true,
                ),
            ],
            fuel_spots: vec![],
            goals: vec![Fuzzy::new(
                Goal {
                    pos: Pos::new(2, 2),
                },
                false,
            )],
            enemies: vec![],
            obstacles: vec![],
        };
        let actual = FuzzyState::from(states);
        assert_eq!(actual, expected);

        // Given two possible goal positions, both should be marked as fuzzy.
        let states = vec![
            State {
                player: Player {
                    pos: Pos::new(0, 0),
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos::new(2, 2),
                },
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player {
                    pos: Pos::new(0, 0),
                    fuel: 10,
                },
                fuel_spots: vec![],
                goal: Goal {
                    pos: Pos::new(3, 3),
                },
                enemies: vec![],
                obstacles: vec![],
            },
        ];
        let expected = FuzzyState {
            players: vec![Fuzzy::new(
                Player {
                    pos: Pos::new(0, 0),
                    fuel: 10,
                },
                false,
            )],
            fuel_spots: vec![],
            goals: vec![
                Fuzzy::new(
                    Goal {
                        pos: Pos::new(2, 2),
                    },
                    true,
                ),
                Fuzzy::new(
                    Goal {
                        pos: Pos::new(3, 3),
                    },
                    true,
                ),
            ],
            enemies: vec![],
            obstacles: vec![],
        };
        let actual = FuzzyState::from(states);
        assert_eq!(actual, expected);

        // TODO(albrow): Expand on tests when we support fuzziness for
        // fuel_spots, enemies, and obstacles.
    }
}
