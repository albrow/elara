use rhai::Engine;

use super::{std_check_win, Level, Outcome};
use crate::actors::AsteroidActor;
use crate::script_runner::ScriptStats;
use crate::simulation::{Actor, AsteroidWarning, DataPoint, Orientation};
use crate::simulation::{Goal, Obstacle, Player, State};
use crate::state_maker::StateMaker;

const DATA_POINT_INFO: &str = r#"This data point will output either `"left"` or `"right"` depending on which way is safe to go."#;

#[derive(Copy, Clone)]
pub struct AsteroidStrike {}

impl AsteroidStrike {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        vec![
            Obstacle::new(1, 2),
            Obstacle::new(1, 3),
            Obstacle::new(1, 4),
            Obstacle::new(2, 2),
            Obstacle::new(2, 4),
            Obstacle::new(3, 2),
            Obstacle::new(3, 4),
            Obstacle::new(4, 2),
            Obstacle::new(4, 4),
            Obstacle::new(4, 5),
            Obstacle::new(4, 6),
            Obstacle::new(4, 7),
            Obstacle::new(5, 2),
            Obstacle::new(6, 2),
            Obstacle::new(6, 4),
            Obstacle::new(6, 5),
            Obstacle::new(6, 6),
            Obstacle::new(6, 7),
            Obstacle::new(7, 2),
            Obstacle::new(7, 4),
            Obstacle::new(8, 2),
            Obstacle::new(8, 4),
            Obstacle::new(9, 2),
            Obstacle::new(9, 3),
            Obstacle::new(9, 4),
        ]
    }
}

impl Level for AsteroidStrike {
    fn name(&self) -> &'static str {
        "Asteroid Strike"
    }
    fn short_name(&self) -> &'static str {
        "asteroid_strike"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to either the left or the right goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// This code reads the safe direction from the data point
// (either "left" or "right") and stores it in a variable
// called safe_direction. You DON'T need to change this part.
let safe_direction = read_data();
say("The safe direction is: " + safe_direction);

if safe_direction == "left" {
  // If the safe direction is "left", we should go left.
  move_forward(3);
  turn_left();
  move_forward(3);
}
if safe_direction == "right" {
  // What should we do if the safe direction is "right"?
  // ADD YOUR CODE BELOW

}"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![
            StateMaker::new()
                .with_player(Player::new(5, 6, 12, Orientation::Up))
                .with_obstacles(self.obstacles())
                .with_goals(vec![Goal::new(2, 3), Goal::new(8, 3)])
                .with_data_points(vec![DataPoint::new_with_info(
                    5,
                    7,
                    "left".into(),
                    DATA_POINT_INFO.into(),
                )])
                .with_asteroid_warnings(vec![
                    AsteroidWarning::new(4, 3, 4, false),
                    AsteroidWarning::new(6, 3, 4, true),
                ])
                .build(),
            StateMaker::new()
                .with_player(Player::new(5, 6, 12, Orientation::Up))
                .with_obstacles(self.obstacles())
                .with_goals(vec![Goal::new(2, 3), Goal::new(8, 3)])
                .with_data_points(vec![DataPoint::new_with_info(
                    5,
                    7,
                    "right".into(),
                    DATA_POINT_INFO.into(),
                )])
                .with_asteroid_warnings(vec![
                    AsteroidWarning::new(4, 3, 4, true),
                    AsteroidWarning::new(6, 3, 4, false),
                ])
                .build(),
        ]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(AsteroidActor::new())]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Reach the goal without using the `read_data` function.")
    }
    fn check_challenge(&self, _states: &[State], script: &str, _stats: &ScriptStats) -> bool {
        // Strip the comments first, then check if the script contains "read_data".
        if let Ok(script) = Engine::new().compact_script(script) {
            return !script.contains("read_data");
        }
        // Otherwise, challenge is considered not passed.
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &AsteroidStrike {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success because we
        // are accounting for both possible directions.
        let script = r#"
            let safe_direction = read_data();
            say("The safe direction is: " + safe_direction);

            if safe_direction == "left" {
                // If the safe direction is "left", we should go left.
                move_forward(3);
                turn_left();
                move_forward(3);
            }
            if safe_direction == "right" {
                // What should we do if the safe direction is "right"?
                // ADD YOUR CODE BELOW
                move_forward(3);
                turn_right();
                move_forward(3);
            }"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Hard-coding the movement direction should always result in failure.
        // In this specific case, it should be Outcome::Continue because we didn't
        // run out of energy, but we didn't reach the goal either.
        let script = r"move_forward(2);
            turn_left();
            move_forward(3);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r"move_forward(2);
            turn_right();
            move_forward(3);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Only accounting for one branch of the if statement should
        // also result in failure.
        let script = r#"
            let safe_direction = read_data();
            say("The safe direction is: " + safe_direction);

            if safe_direction == "left" {
                // If the safe direction is "left", we should go left.
                move_forward(3);
                turn_left();
                move_forward(3);
            }"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r#"
            let safe_direction = read_data();
            say("The safe direction is: " + safe_direction);

            if safe_direction == "right" {
                // What should we do if the safe direction is "right"?
                // ADD YOUR CODE BELOW
                move_forward(3);
                turn_right();
                move_forward(3);
            }"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &AsteroidStrike {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r#"
            let safe_direction = read_data();
            say("The safe direction is: " + safe_direction);

            if safe_direction == "left" {
                // If the safe direction is "left", we should go left.
                move_forward(3);
                turn_left();
                move_forward(3);
            }
            if safe_direction == "right" {
                // What should we do if the safe direction is "right"?
                // ADD YOUR CODE BELOW
                move_forward(3);
                turn_right();
                move_forward(3);
            }"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r"
            move_forward(3);
            turn_right();
            move_forward(3);
            move_backward(3);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);

        // Having read_data in the comments should be okay.
        let script = r"
            // read_data();
            // read_data
            move_forward(3);
            turn_right();
            move_forward(3);
            move_backward(3);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
