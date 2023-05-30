use rhai::Engine;

use super::{std_check_win, Level, Outcome};
use crate::actors::{Bounds, EvilRoverActor};
use crate::script_runner::ScriptStats;
use crate::simulation::{Actor, DataTerminal, Enemy, Orientation};
use crate::simulation::{Goal, Obstacle, Player, State};
use crate::state_maker::StateMaker;

#[derive(Copy, Clone)]
pub struct EnemiesAndAsteroids {}

lazy_static! {
    // This list includes the get_position function which is necessary
    // for beating the bonus challenge.
    static ref AVAIL_FUNCS: Vec<&'static str> = vec![
        "move_forward",
        "move_backward",
        "turn_left",
        "turn_right",
        "say",
        "read_data",
    ];
}

impl EnemiesAndAsteroids {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        return vec![
            Obstacle::new(0, 7),
            Obstacle::new(1, 1),
            Obstacle::new(1, 3),
            Obstacle::new(1, 4),
            Obstacle::new(1, 5),
            Obstacle::new(1, 7),
            Obstacle::new(2, 1),
            Obstacle::new(2, 5),
            Obstacle::new(2, 7),
            Obstacle::new(3, 1),
            Obstacle::new(3, 3),
            // Obstacle::new(3, 5),
            Obstacle::new(3, 7),
            Obstacle::new(4, 1),
            Obstacle::new(4, 3),
            Obstacle::new(4, 5),
            Obstacle::new(4, 6),
            Obstacle::new(4, 7),
            Obstacle::new(5, 7),
            Obstacle::new(6, 1),
            Obstacle::new(6, 3),
            Obstacle::new(6, 5),
            Obstacle::new(6, 6),
            Obstacle::new(6, 7),
            Obstacle::new(7, 1),
            Obstacle::new(7, 3),
            // Obstacle::new(7, 5),
            Obstacle::new(7, 7),
            Obstacle::new(8, 1),
            Obstacle::new(8, 5),
            Obstacle::new(8, 7),
            Obstacle::new(9, 1),
            Obstacle::new(9, 3),
            Obstacle::new(9, 4),
            Obstacle::new(9, 5),
            Obstacle::new(9, 7),
            Obstacle::new(10, 7),
            Obstacle::new(11, 7),
        ];
    }
}

impl Level for EnemiesAndAsteroids {
    fn name(&self) -> &'static str {
        // TODO(albrow): Change this name.
        "Into Danger"
    }
    fn short_name(&self) -> &'static str {
        "enemies_and_asteroids"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to one of the goals ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAIL_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        r#"
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state_maker = StateMaker::new();
        let base_state = state_maker
            .with_player(Player::new(5, 6, 50, Orientation::Up))
            .with_goals(vec![Goal::new(7, 6), Goal::new(3, 6)])
            .with_enemies(vec![
                Enemy::new(8, 2, Orientation::Down),
                Enemy::new(2, 2, Orientation::Down),
            ]);
        vec![
            base_state
                .clone()
                .with_obstacles(
                    [
                        self.obstacles().clone(),
                        vec![Obstacle::new(4, 0), Obstacle::new(4, 4)],
                    ]
                    .concat(),
                )
                .with_data_terminal(vec![DataTerminal::new(5, 7, "right".into())])
                .build(),
            base_state
                .clone()
                .with_obstacles(
                    [
                        self.obstacles().clone(),
                        vec![Obstacle::new(6, 0), Obstacle::new(6, 4)],
                    ]
                    .concat(),
                )
                .with_data_terminal(vec![DataTerminal::new(5, 7, "left".into())])
                .build(),
        ]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![
            Box::new(EvilRoverActor::new(0, Bounds::default())),
            Box::new(EvilRoverActor::new(1, Bounds::default())),
        ]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        constants::{ERR_DESTROYED_BY_ENEMY, ERR_OUT_OF_FUEL},
        levels::Outcome,
    };

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &EnemiesAndAsteroids {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success because we
        // are accounting for all three possible directions.
        let script = r#"
            let safe_direction = read_data();

            if safe_direction == "right" { 
                move_forward(6);
                turn_right();
                move_forward(5);
                turn_right();
                move_forward(6);
                turn_right();
                move_forward(3);
            }
            if safe_direction == "left" {
                move_forward(6);
                turn_left();
                move_forward(5);
                turn_left();
                move_forward(6);
                turn_left();
                move_forward(3);
            }
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Trying to take the shortest path should result in failure.
        let script = r#"
            let safe_direction = read_data();

            if safe_direction == "right" { 
                move_forward(2);
                turn_right();
                move_forward(2);
                turn_right();
                move_forward(2);
            }
            if safe_direction == "left" {
                move_forward(2);
                turn_left();
                move_forward(2);
                turn_left();
                move_forward(2);
            }
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_DESTROYED_BY_ENEMY.into())
        );
    }

    // #[test]
    // fn challenge() {
    //     let mut game = crate::Game::new();
    //     const LEVEL: &'static dyn Level = &EnemiesAndAsteroids {};

    //     // This code beats the level, but doesn't satisfy the challenge conditions.
    //     let script = r#"
    //         let safe_direction = read_data();
    //         move_forward(3);
    //         if safe_direction == "top" {
    //             turn_left();
    //         }
    //         if safe_direction == "bottom" {
    //             turn_right();
    //         }
    //         move_forward(3);
    //     "#;
    //     let result = game
    //         .run_player_script_internal(script.to_string(), LEVEL)
    //         .unwrap();
    //     assert_eq!(result.outcome, Outcome::Success);
    //     assert_eq!(result.passes_challenge, false);

    //     // This code doesn't beat the level because the rover runs out
    //     // of fuel.
    //     let script = r"
    //         move_forward(6);
    //         turn_left();
    //         move_forward(3);
    //         turn_right();
    //         turn_right();
    //         move_forward(3);";
    //     let result = game
    //         .run_player_script_internal(script.to_string(), LEVEL)
    //         .unwrap();
    //     assert_eq!(
    //         result.outcome,
    //         Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
    //     );
    //     assert_eq!(result.passes_challenge, false);

    //     // This code should beat the level and pass the challenge.
    //     let script = r"
    //         fn try_move_forward(n) {
    //             // Record the current position and try moving forward one space.
    //             let pos = get_position();
    //             move_forward(1);
    //             // Check the new position. If we're blocked, then the new position
    //             // will be the same as the old.
    //             let new_pos = get_position();
    //             if pos == new_pos {
    //             // In this case, return early (i.e. don't keep trying to move).
    //             return;
    //             }
    //             // Otherwise, we're not blocked. Keep moving the remaining
    //             // number of spaces.
    //             move_forward(n-1);
    //         }

    //         move_forward(3);
    //         try_move_forward(3);
    //         turn_left();
    //         try_move_forward(3);
    //         turn_right();
    //         turn_right();
    //         try_move_forward(3);";
    //     let result = game
    //         .run_player_script_internal(script.to_string(), LEVEL)
    //         .unwrap();
    //     assert_eq!(result.outcome, Outcome::Success);
    //     assert_eq!(result.passes_challenge, true);
    // }
}
