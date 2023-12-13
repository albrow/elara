mod asteroid_strike;
mod asteroid_strike_part_two;
mod big_enemy;
mod button_and_gate;
mod buttons_part_one;
mod data_point_demo;
mod data_points_part_one;
mod enemies_and_asteroids;
mod enemies_part_one;
mod enemies_part_two;
mod enemies_with_telepad;
mod energy_part_one;
mod gate_and_data_point;
mod gate_and_data_point_array;
mod gate_and_data_point_three;
mod gate_and_data_point_two;
mod gates;
mod loops_part_one;
mod loops_part_two;
mod movement;
mod movement_part_two;
mod partly_disabled_movement;
mod reimplement_turn_right;
mod sandbox;
mod sandbox_with_data_point;
mod server_room;
mod telepad_part_one;
mod telepad_part_two;
mod telepads_and_while_loop;
mod variables_intro;

use crate::actors::{Bounds, BIG_ENEMY_SIZE};
use crate::constants::{ERR_DESTROYED_BY_ENEMY, ERR_OUT_OF_ENERGY, HEIGHT, WIDTH};
use crate::script_runner::ScriptStats;
use crate::simulation::State;
use crate::simulation::{Actor, AsteroidWarning, ObstacleKind, Orientation, Pos};
use std::collections::{HashMap, HashSet};

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

lazy_static! {
    static ref EMPTY_VEC: Vec<&'static str> = vec![];
}

pub trait Level {
    fn name(&self) -> &'static str;
    fn short_name(&self) -> &'static str;
    fn objective(&self) -> &'static str;
    fn initial_code(&self) -> &'static str;
    fn initial_states(&self) -> Vec<State>;
    fn actors(&self) -> Vec<Box<dyn Actor>>;
    fn check_win(&self, state: &State) -> Outcome;
    fn bounds(&self) -> Bounds {
        Bounds {
            min_x: 0,
            max_x: (WIDTH - 1) as i32,
            min_y: 0,
            max_y: (HEIGHT - 1) as i32,
        }
    }
    fn disabled_functions(&self) -> &'static Vec<&'static str> {
        &EMPTY_VEC
    }
    fn challenge(&self) -> Option<&'static str> {
        None
    }
    fn check_challenge(&self, _states: &[State], _script: &str, _stats: &ScriptStats) -> bool {
        false
    }

    /// Returns asteroid warnings based on the given possible initial states
    /// for this level.
    fn asteroid_warnings(&self) -> Vec<AsteroidWarning> {
        generate_asteroid_warnings(self.initial_states())
    }
    /// Returns an initial state which only contains elements which are present
    /// in ALL possible initial states. E.g. if an asteroid is present in one state
    /// but not another, it will not be included in the filtered state. Note that this
    /// only considers the position of elements, not their details (e.g. it doesn't consider
    /// what data a DataPoint holds).
    fn filtered_initial_state(&self) -> State {
        // For now, asteroids are the only thing we need to worry about. We can simplify
        // this by re-using our asteroid warnings logic.
        let warnings = self.asteroid_warnings();

        // Then remove any asteroids with a position equal to a warning's position.
        let mut filtered_state = self.initial_states()[0].clone();
        filtered_state.obstacles.retain(|x| {
            !warnings
                .iter()
                .any(|warning| warning.pos == x.pos && x.kind == ObstacleKind::Asteroid)
        });
        filtered_state
    }
}

// Special constants for sandbox levels. Used in some tests.
#[allow(dead_code)]
pub const SANDBOX_LEVEL: &'static dyn Level = &sandbox::Sandbox {};
#[allow(dead_code)]
pub const SANDBOX_LEVEL_WITH_DATA_POINT: &'static dyn Level =
    &sandbox_with_data_point::SandboxWithDataPoint {};

lazy_static! {
    #[derive(Debug, Clone, Copy)]
    pub static ref LEVELS: HashMap<&'static str, Box<dyn Level + Sync>> = {
        let mut m: HashMap<&'static str, Box<dyn Level + Sync>> = HashMap::new();
        m.insert(movement::Movement {}.short_name(), Box::new(movement::Movement {}));
        m.insert(movement_part_two::MovementPartTwo {}.short_name(), Box::new(movement_part_two::MovementPartTwo {}));
        m.insert(energy_part_one::EnergyPartOne {}.short_name(), Box::new(energy_part_one::EnergyPartOne {}));
        m.insert(data_points_part_one::DataPointsPartOne {}.short_name(),
            Box::new(data_points_part_one::DataPointsPartOne {}),
        );
        m.insert(gates::Gates {}.short_name(), Box::new(gates::Gates {}));
        m.insert(variables_intro::VariablesIntro{}.short_name(), Box::new(variables_intro::VariablesIntro{}));
        m.insert(gate_and_data_point::GateAndDataPoint {}.short_name(),
            Box::new(gate_and_data_point::GateAndDataPoint {}),
        );
        m.insert(gate_and_data_point_two::GateAndDataPointPartTwo {}.short_name(),
            Box::new(gate_and_data_point_two::GateAndDataPointPartTwo {}),
        );
        m.insert(gate_and_data_point_three::GateAndDataPointPartThree {}.short_name(),
            Box::new(gate_and_data_point_three::GateAndDataPointPartThree {}),
        );
        m.insert(enemies_part_one::EnemiesPartOne {}.short_name(), Box::new(enemies_part_one::EnemiesPartOne {}));
        m.insert(loops_part_one::LoopsPartOne {}.short_name(), Box::new(loops_part_one::LoopsPartOne {}));
        m.insert(loops_part_two::LoopsPartTwo {}.short_name(), Box::new(loops_part_two::LoopsPartTwo {}));
        m.insert(sandbox::Sandbox{}.short_name(), Box::new(sandbox::Sandbox{}));
        m.insert(sandbox_with_data_point::SandboxWithDataPoint{}.short_name(), Box::new(sandbox_with_data_point::SandboxWithDataPoint {}));
        m.insert(asteroid_strike::AsteroidStrike{}.short_name(), Box::new(asteroid_strike::AsteroidStrike{}));
        m.insert(asteroid_strike_part_two::AsteroidStrikePartTwo{}.short_name(), Box::new(asteroid_strike_part_two::AsteroidStrikePartTwo{}));
        m.insert(data_point_demo::DataPointDemo{}.short_name(), Box::new(data_point_demo::DataPointDemo{}));
        m.insert(partly_disabled_movement::PartlyDisabledMovement{}.short_name(), Box::new(partly_disabled_movement::PartlyDisabledMovement{}));
        m.insert(reimplement_turn_right::ReimplementTurnRight{}.short_name(), Box::new(reimplement_turn_right::ReimplementTurnRight{}));
        m.insert(gate_and_data_point_array::GateAndDataPointArray{}.short_name(), Box::new(gate_and_data_point_array::GateAndDataPointArray{}));
        m.insert(telepad_part_one::TelepadPartOne{}.short_name(), Box::new(telepad_part_one::TelepadPartOne{}));
        m.insert(telepad_part_two::TelepadPartTwo{}.short_name(), Box::new(telepad_part_two::TelepadPartTwo{}));
        m.insert(enemies_part_two::EnemiesPartTwo{}.short_name(), Box::new(enemies_part_two::EnemiesPartTwo{}));
        m.insert(enemies_with_telepad::EnemiesWithTelepad{}.short_name(), Box::new(enemies_with_telepad::EnemiesWithTelepad{}));
        m.insert(enemies_and_asteroids::EnemiesAndAsteroids{}.short_name(), Box::new(enemies_and_asteroids::EnemiesAndAsteroids{}));
        m.insert(buttons_part_one::ButtonsPartOne{}.short_name(), Box::new(buttons_part_one::ButtonsPartOne{}));
        m.insert(button_and_gate::ButtonAndGate{}.short_name(), Box::new(button_and_gate::ButtonAndGate{}));
        m.insert(telepads_and_while_loop::TelepadsAndWhileLoop{}.short_name(), Box::new(telepads_and_while_loop::TelepadsAndWhileLoop{}));
        m.insert(big_enemy::BigEnemyLevel{}.short_name(), Box::new(big_enemy::BigEnemyLevel{}));
        m.insert(server_room::ServerRoom{}.short_name(), Box::new(server_room::ServerRoom{}));

        m
    };
}

fn is_destroyed_by_enemy(state: &State) -> bool {
    // First check for regular sized enemies.
    if state
        .enemies
        .iter()
        .any(|enemy| enemy.pos == state.player.pos)
    {
        return true;
    }

    // Then check for big enemies (which are size 3x3).
    for big_enemy in &state.big_enemies {
        for x in big_enemy.pos.x..big_enemy.pos.x + BIG_ENEMY_SIZE {
            for y in big_enemy.pos.y..big_enemy.pos.y + BIG_ENEMY_SIZE {
                if state.player.pos == (Pos { x, y }) {
                    return true;
                }
            }
        }
    }
    false
}

fn did_reach_goal(state: &State) -> bool {
    for goal in state.goals.iter() {
        if state.player.pos == goal.pos {
            return true;
        }
    }
    false
}

/// Returns asteroid warnings based on the given possible initial states.
/// An AsteroidWarning is generated any time that an asteroid may exist in
/// one state but not another.
pub fn generate_asteroid_warnings(initial_states: Vec<State>) -> Vec<AsteroidWarning> {
    if initial_states.is_empty() {
        panic!("Error computing fuzzy state: states cannot be empty");
    }

    // Start by looking at only the first possible state.
    let first_state = &initial_states[0];
    let first_state_asteroids = first_state
        .obstacles
        .iter()
        .filter(|x| x.kind == ObstacleKind::Asteroid);
    let mut warnings = HashSet::new();

    // Iterate through the remaining states (i.e. starting at index 1), and if
    // any asteroids exist in the first state but not in another, add a corresponding
    // warning.
    for state in initial_states.iter().skip(1) {
        // If an asteroid is present in first_state state but not this one, add a warning.
        for asteroid in first_state_asteroids.clone() {
            if !state.obstacles.contains(asteroid) {
                warnings.insert(AsteroidWarning {
                    pos: asteroid.pos.clone(),
                });
            }
        }

        // Likewise if an asteroid is present in this state but not first_state, add a warning.
        let this_state_asteroids = state
            .obstacles
            .iter()
            .filter(|x| x.kind == ObstacleKind::Asteroid);
        for asteroid in this_state_asteroids {
            if !first_state.obstacles.contains(asteroid) {
                warnings.insert(AsteroidWarning {
                    pos: asteroid.pos.clone(),
                });
            }
        }
    }

    warnings.into_iter().collect()
}

/// An implementation of Level::check_win which covers some common
/// success and failure cases. Some levels may need to implement
/// their own logic on top of this.
pub fn std_check_win(state: &State) -> Outcome {
    if is_destroyed_by_enemy(state) {
        Outcome::Failure(ERR_DESTROYED_BY_ENEMY.to_string())
    } else if did_reach_goal(state) {
        Outcome::Success
    } else if state.player.energy == 0 {
        Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
    } else {
        Outcome::Continue
    }
}

/// An implementation of Level::check_win for levels without an
/// explicit objective. Some levels may need to implement
/// their own logic on top of this.
pub fn no_objective_check_win(state: &State) -> Outcome {
    if state.player.energy == 0 {
        Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
    } else {
        Outcome::NoObjective
    }
}

/// Expects an array of initial states for a level where each state
/// has only one possible orientation for each telepad. Expands the
/// possible states to include all possible orientations for each
/// telepad. Returns the new, expanded states.
pub fn make_all_initial_states_for_telepads(states: Vec<State>) -> Vec<State> {
    let mut new_states = vec![];
    for state in states.iter() {
        if state.telepads.is_empty() {
            new_states.push(state.clone());
            continue;
        } else if state.telepads.len() > 3 {
        }
        for orientation in [
            Orientation::Up,
            Orientation::Down,
            Orientation::Left,
            Orientation::Right,
        ] {
            let mut new_state = state.clone();
            new_state.telepads[0].end_facing = orientation;
            if state.telepads.len() == 1 {
                // If there is only one telepad, we only need to create a new state
                // for each possible orientation (i.e. 4 total).
                new_states.push(new_state);
            } else if state.telepads.len() == 2 {
                // If there are two telepads, we need to create a new state for each
                // *combination* of orientations for the two telepads (i.e. 16 total).
                for orientation in [
                    Orientation::Up,
                    Orientation::Down,
                    Orientation::Left,
                    Orientation::Right,
                ] {
                    let mut nested_state = new_state.clone();
                    nested_state.telepads[1].end_facing = orientation;
                    new_states.push(nested_state);
                }
            } else if state.telepads.len() == 3 {
                // For the first two telepads, we need to create a new state for each
                // *combination* of orientations for the two telepads (i.e. 16 total).
                for orientation in [
                    Orientation::Up,
                    Orientation::Down,
                    Orientation::Left,
                    Orientation::Right,
                ] {
                    let mut nested_state = new_state.clone();
                    nested_state.telepads[1].end_facing = orientation;
                    // The third telepad piggybacks off of the second one by simply flipping
                    // it. This limits the total number of possible initial states that we create.
                    nested_state.telepads[2].end_facing = orientation.flip();
                    new_states.push(nested_state);
                }
            } else {
                // The total number of initial states grows with 4^n where n is the
                // number of telepads. When the user runs a script, the simulation is
                // run once for each possible initial state. Therefore, we need to limit
                // the number of initial states in order to keep the total script run time
                // low.
                panic!(
                    "Error computing initial states for telepads: max number of telepads exceeded."
                );
            }
        }
    }
    new_states
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        simulation::{Obstacle, Orientation, Pos, Telepad},
        state_maker::StateMaker,
    };

    #[test]
    fn asteroid_warnings() {
        let initial_states = vec![
            StateMaker::new()
                .with_obstacles(vec![
                    Obstacle::new_with_kind(0, 1, ObstacleKind::Rock),
                    Obstacle::new_with_kind(0, 2, ObstacleKind::Asteroid),
                    Obstacle::new_with_kind(0, 3, ObstacleKind::Asteroid),
                ])
                .build(),
            StateMaker::new()
                .with_obstacles(vec![
                    Obstacle::new_with_kind(0, 1, ObstacleKind::Rock),
                    Obstacle::new_with_kind(0, 2, ObstacleKind::Asteroid),
                    Obstacle::new_with_kind(0, 4, ObstacleKind::Asteroid),
                ])
                .build(),
            StateMaker::new()
                .with_obstacles(vec![
                    Obstacle::new_with_kind(0, 1, ObstacleKind::Rock),
                    Obstacle::new_with_kind(0, 2, ObstacleKind::Asteroid),
                    Obstacle::new_with_kind(0, 5, ObstacleKind::Asteroid),
                ])
                .build(),
        ];

        // Note: Warnings can come out in any order, so we sort them by y position
        // before comparing.
        let mut warnings = generate_asteroid_warnings(initial_states);
        warnings.sort_by(|a, b| a.pos.y.cmp(&b.pos.y));
        assert_eq!(
            warnings,
            vec![
                AsteroidWarning {
                    pos: Pos::new(0, 3)
                },
                AsteroidWarning {
                    pos: Pos::new(0, 4)
                },
                AsteroidWarning {
                    pos: Pos::new(0, 5)
                },
            ]
        );
    }

    #[test]
    fn test_make_all_initial_states_for_telepads() {
        let state = StateMaker::new()
            .with_telepads(vec![
                Telepad::new((0, 0), (1, 1), Orientation::Up),
                Telepad::new((2, 2), (3, 3), Orientation::Up),
            ])
            .build();
        let initial_states = vec![state];

        // We should get 16 states back, one for each possible combination of
        // telepad ending orientations.
        let full_initial_states = make_all_initial_states_for_telepads(initial_states);
        let expected = vec![
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Up),
                    Telepad::new((2, 2), (3, 3), Orientation::Up),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Up),
                    Telepad::new((2, 2), (3, 3), Orientation::Down),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Up),
                    Telepad::new((2, 2), (3, 3), Orientation::Left),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Up),
                    Telepad::new((2, 2), (3, 3), Orientation::Right),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Down),
                    Telepad::new((2, 2), (3, 3), Orientation::Up),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Down),
                    Telepad::new((2, 2), (3, 3), Orientation::Down),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Down),
                    Telepad::new((2, 2), (3, 3), Orientation::Left),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Down),
                    Telepad::new((2, 2), (3, 3), Orientation::Right),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Left),
                    Telepad::new((2, 2), (3, 3), Orientation::Up),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Left),
                    Telepad::new((2, 2), (3, 3), Orientation::Down),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Left),
                    Telepad::new((2, 2), (3, 3), Orientation::Left),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Left),
                    Telepad::new((2, 2), (3, 3), Orientation::Right),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Right),
                    Telepad::new((2, 2), (3, 3), Orientation::Up),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Right),
                    Telepad::new((2, 2), (3, 3), Orientation::Down),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Right),
                    Telepad::new((2, 2), (3, 3), Orientation::Left),
                ])
                .build(),
            StateMaker::new()
                .with_telepads(vec![
                    Telepad::new((0, 0), (1, 1), Orientation::Right),
                    Telepad::new((2, 2), (3, 3), Orientation::Right),
                ])
                .build(),
        ];
        assert_eq!(full_initial_states.len(), expected.len());
        assert_eq!(full_initial_states, expected);
    }
}
