mod buzzing_sound;
mod comparisons;
mod expressions;
mod first_steps;
mod fuel_up;
mod hello_world;
mod loop_the_loop;
mod math_expressions;
mod more_trouble;
mod seeing_double;

use crate::constants::ERR_OUT_OF_FUEL;
use crate::simulation::Actor;
use crate::simulation::{Enemy, FuelSpot, Goal, Obstacle, Player, State};

use crate::levels::buzzing_sound::BuzzingSound;
use crate::levels::comparisons::Comparisons;
use crate::levels::expressions::Expressions;
use crate::levels::first_steps::FirstSteps;
use crate::levels::fuel_up::FuelUp;
use crate::levels::hello_world::HelloWorld;
use crate::levels::loop_the_loop::LoopTheLoop;
use crate::levels::math_expressions::MathExpressions;
use crate::levels::more_trouble::MoreTrouble;
use crate::levels::seeing_double::SeeingDouble;

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
    fn objective(&self) -> &'static str;
    fn initial_code(&self) -> &'static str;
    fn initial_states(&self) -> Vec<State>;
    fn actors(&self) -> Vec<Box<dyn Actor>>;
    fn check_win(&self, state: &State) -> Outcome;
    fn new_core_concepts(&self) -> Vec<&'static str> {
        vec![]
    }
    fn initial_fuzzy_state(&self) -> FuzzyState {
        FuzzyState::from(self.initial_states())
    }
}

lazy_static! {
    pub static ref LEVELS: [Box<dyn Level + Sync>; 10] = [
        Box::new(HelloWorld {}),
        Box::new(FirstSteps {}),
        Box::new(Expressions {}),
        Box::new(FuelUp {}),
        Box::new(MathExpressions {}),
        Box::new(Comparisons {}),
        Box::new(LoopTheLoop {}),
        Box::new(BuzzingSound {}),
        Box::new(SeeingDouble {}),
        Box::new(MoreTrouble {}),
    ];
}

// Ignore dead code warning because this is used in tests.
#[allow(dead_code)]
fn level_index_by_name(name: &str) -> usize {
    LEVELS.iter().position(|l| l.name() == name).unwrap()
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
            },
            State {
                player: Player::new(1, 1, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos::new(2, 2),
                }),
                enemies: vec![],
                obstacles: vec![],
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
            },
            State {
                player: Player::new(0, 0, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos::new(3, 3),
                }),
                enemies: vec![],
                obstacles: vec![],
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
        }];
        let expected = FuzzyState {
            players: vec![Fuzzy::new(Player::new(0, 0, 10), false)],
            fuel_spots: vec![],
            goals: vec![],
            enemies: vec![],
            obstacles: vec![],
        };
        let actual = FuzzyState::from(states);
        assert_eq!(actual, expected);

        // TODO(albrow): Expand on tests when we support fuzziness for
        // fuel_spots, enemies, and obstacles.
    }
}
