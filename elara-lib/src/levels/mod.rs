mod enemies_part_one;
mod fuel_part_one;
mod gate_and_terminal;
mod gates;
mod glitches_part_one;
mod glitches_part_two;
mod loops_part_one;
mod loops_part_two;
mod movement;
mod movement_part_two;
mod sandbox;
mod seismic_activity;

use std::collections::HashMap;

use crate::actors::Bounds;
use crate::constants::{ERR_DESTROYED_BY_BUG, ERR_OUT_OF_FUEL, HEIGHT, WIDTH};
use crate::simulation::Actor;
use crate::simulation::{
    DataTerminal, Enemy, FuelSpot, Goal, Obstacle, PasswordGate, Player, State,
};

#[derive(PartialEq, Clone, Debug)]
pub enum Outcome {
    // Continue running the code, but this is considered a failure if there is no code left to run.
    Continue,
    // The win condition was met.
    Success,
    // Some failure condition was reached.
    Failure(String),
    // Used for levels without any set objective.
    NoObjective,
}

pub trait Level {
    fn name(&self) -> &'static str;
    fn short_name(&self) -> &'static str;
    fn objective(&self) -> &'static str;
    fn initial_code(&self) -> &'static str;
    fn initial_states(&self) -> Vec<State>;
    fn actors(&self) -> Vec<Box<dyn Actor>>;
    fn check_win(&self, state: &State) -> Outcome;
    fn initial_fuzzy_state(&self) -> FuzzyState {
        FuzzyState::from(self.initial_states())
    }
    fn bounds(&self) -> Bounds {
        Bounds {
            min_x: 0,
            max_x: (WIDTH - 1) as i32,
            min_y: 0,
            max_y: (HEIGHT - 1) as i32,
        }
    }
}

lazy_static! {
    #[derive(Debug, Clone, Copy)]
    pub static ref LEVELS: HashMap<&'static str, Box<dyn Level + Sync>> = {
        let mut m: HashMap<&'static str, Box<dyn Level + Sync>> = HashMap::new();
        m.insert(movement::Movement {}.short_name(), Box::new(movement::Movement {}));
        m.insert(movement_part_two::MovementPartTwo {}.short_name(), Box::new(movement_part_two::MovementPartTwo {}));
        m.insert(fuel_part_one::FuelPartOne {}.short_name(), Box::new(fuel_part_one::FuelPartOne {}));
        m.insert(gates::Gates {}.short_name(), Box::new(gates::Gates {}));
        m.insert(gate_and_terminal::GateAndTerminal {}.short_name(),
            Box::new(gate_and_terminal::GateAndTerminal {}),
        );
        m.insert(enemies_part_one::EnemiesPartOne {}.short_name(), Box::new(enemies_part_one::EnemiesPartOne {}));
        m.insert(loops_part_one::LoopsPartOne {}.short_name(), Box::new(loops_part_one::LoopsPartOne {}));
        m.insert(loops_part_two::LoopsPartTwo {}.short_name(), Box::new(loops_part_two::LoopsPartTwo {}));
        m.insert(glitches_part_one::GlitchesPartOne {}.short_name(), Box::new(glitches_part_one::GlitchesPartOne {}));
        m.insert(glitches_part_two::GlitchesPartTwo {}.short_name(), Box::new(glitches_part_two::GlitchesPartTwo {}));
        m.insert(sandbox::Sandbox{}.short_name(), Box::new(sandbox::Sandbox{}));
        m.insert(seismic_activity::SeismicActivity{}.short_name(), Box::new(seismic_activity::SeismicActivity{}));

        m
    };
}

fn is_destroyed_by_enemy(state: &State) -> bool {
    state
        .enemies
        .iter()
        .any(|enemy| enemy.pos == state.player.pos)
}

fn did_reach_goal(state: &State) -> bool {
    if state.goal.is_some() && state.player.pos == state.goal.as_ref().unwrap().pos {
        true
    } else {
        false
    }
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
    pub password_gates: Vec<Fuzzy<PasswordGate>>,
    pub data_terminals: Vec<Fuzzy<DataTerminal>>,
}

impl FuzzyState {
    pub fn from_single_state(state: &State) -> Self {
        let goals = if let Some(goal) = state.goal.clone() {
            vec![Fuzzy::new(goal, false)]
        } else {
            vec![]
        };
        Self {
            players: vec![Fuzzy::new(state.player.clone(), false)],
            fuel_spots: state
                .fuel_spots
                .clone()
                .into_iter()
                .map(|x| Fuzzy::new(x, false))
                .collect(),
            goals: goals,
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
            password_gates: state
                .password_gates
                .clone()
                .into_iter()
                .map(|x| Fuzzy::new(x, false))
                .collect(),
            data_terminals: state
                .data_terminals
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
            if let Some(goal) = state.goal.clone() {
                if !fuzzy_state.goals.contains(&Fuzzy::new(goal.clone(), false)) {
                    for goal in fuzzy_state.goals.iter_mut() {
                        goal.fuzzy = true;
                    }
                    fuzzy_state.goals.push(Fuzzy::new(goal, true));
                }
            }
            // If an obstacle is present in one state but not the other, mark it as fuzzy.
            for obstacle in fuzzy_state.obstacles.iter_mut() {
                if !state.obstacles.contains(&obstacle.obj) && !obstacle.fuzzy {
                    obstacle.fuzzy = true;
                }
            }
            for obstacle in state.obstacles.iter() {
                if !fuzzy_state
                    .obstacles
                    .contains(&Fuzzy::new(obstacle.clone(), false))
                {
                    fuzzy_state
                        .obstacles
                        .push(Fuzzy::new(obstacle.clone(), true));
                }
            }
        }

        fuzzy_state
    }
}

/// An implementation of Level::check_win which covers some common
/// success and failure cases. Some levels may need to implement
/// their own logic on top of this.
pub fn std_check_win(state: &State) -> Outcome {
    if did_reach_goal(state) {
        Outcome::Success
    } else if state.player.fuel == 0 {
        Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
    } else if is_destroyed_by_enemy(state) {
        Outcome::Failure(ERR_DESTROYED_BY_BUG.to_string())
    } else {
        Outcome::Continue
    }
}

/// An implementation of Level::check_win for levels without an
/// explicit objective. Some levels may need to implement
/// their own logic on top of this.
pub fn no_objective_check_win(state: &State) -> Outcome {
    if state.player.fuel == 0 {
        Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
    } else {
        Outcome::NoObjective
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
    use crate::simulation::Pos;

    #[test]
    fn to_fuzzy_state() {
        // Given one possible initial state, the fuzzy state should be identical,
        // with all objects marked as non-fuzzy.
        let states = vec![State {
            player: Player::new(0, 0, 10),
            fuel_spots: vec![],
            goal: Some(Goal {
                pos: Pos::new(1, 1),
            }),
            enemies: vec![],
            obstacles: vec![],
            password_gates: vec![],
            data_terminals: vec![],
        }];
        let expected = FuzzyState {
            players: vec![Fuzzy::new(Player::new(0, 0, 10), false)],
            fuel_spots: vec![],
            goals: vec![Fuzzy::new(
                Goal {
                    pos: Pos::new(1, 1),
                },
                false,
            )],
            enemies: vec![],
            obstacles: vec![],
            password_gates: vec![],
            data_terminals: vec![],
        };
        let actual = FuzzyState::from(states);
        assert_eq!(actual, expected);

        // Given two possible player positions, both should be marked as fuzzy.
        let states = vec![
            State {
                player: Player::new(0, 0, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos::new(2, 2),
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(1, 1, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos::new(2, 2),
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
        ];
        let expected = FuzzyState {
            players: vec![
                Fuzzy::new(Player::new(0, 0, 10), true),
                Fuzzy::new(Player::new(1, 1, 10), true),
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
            password_gates: vec![],
            data_terminals: vec![],
        };
        let actual = FuzzyState::from(states);
        assert_eq!(actual, expected);

        // Given two possible goal positions, both should be marked as fuzzy.
        let states = vec![
            State {
                player: Player::new(0, 0, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos::new(2, 2),
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(0, 0, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos::new(3, 3),
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
        ];
        let expected = FuzzyState {
            players: vec![Fuzzy::new(Player::new(0, 0, 10), false)],
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
            password_gates: vec![],
            data_terminals: vec![],
        };
        let actual = FuzzyState::from(states);
        assert_eq!(actual, expected);

        // If goal is None, FuzzyState.goals should be an empty vector.
        let states = vec![State {
            player: Player::new(0, 0, 10),
            fuel_spots: vec![],
            goal: None,
            enemies: vec![],
            obstacles: vec![],
            password_gates: vec![],
            data_terminals: vec![],
        }];
        let expected = FuzzyState {
            players: vec![Fuzzy::new(Player::new(0, 0, 10), false)],
            fuel_spots: vec![],
            goals: vec![],
            enemies: vec![],
            obstacles: vec![],
            password_gates: vec![],
            data_terminals: vec![],
        };
        let actual = FuzzyState::from(states);
        assert_eq!(actual, expected);

        // TODO(albrow): Expand on tests when we support fuzziness for
        // fuel_spots, enemies, and obstacles, etc. Right now we don't
        // support fuzziness for arrays/vectors.
    }
}
