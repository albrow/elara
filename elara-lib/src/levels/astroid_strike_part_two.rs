use rhai::Engine;

use super::{std_check_win, Level, Outcome};
use crate::script_runner::ScriptStats;
use crate::simulation::{Actor, DataTerminal, Orientation};
use crate::simulation::{Goal, Obstacle, Player, State};

#[derive(Copy, Clone)]
pub struct AstroidStrikePartTwo {}

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
        "get_position",
    ];
}

impl AstroidStrikePartTwo {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        return vec![
            Obstacle::new(0, 2),
            Obstacle::new(0, 4),
            Obstacle::new(1, 2),
            Obstacle::new(1, 4),
            Obstacle::new(2, 2),
            Obstacle::new(2, 4),
            Obstacle::new(3, 0),
            Obstacle::new(3, 1),
            Obstacle::new(3, 2),
            Obstacle::new(3, 4),
            Obstacle::new(3, 5),
            Obstacle::new(3, 6),
            Obstacle::new(3, 7),
            Obstacle::new(4, 7),
            Obstacle::new(5, 0),
            Obstacle::new(5, 1),
            Obstacle::new(5, 2),
            Obstacle::new(5, 4),
            Obstacle::new(5, 5),
            Obstacle::new(5, 6),
            Obstacle::new(5, 7),
            Obstacle::new(6, 2),
            Obstacle::new(6, 4),
            Obstacle::new(7, 2),
            Obstacle::new(7, 4),
            Obstacle::new(8, 2),
            Obstacle::new(8, 3),
            Obstacle::new(8, 4),
        ];
    }
}

impl Level for AstroidStrikePartTwo {
    fn name(&self) -> &'static str {
        "On Your Own"
    }
    fn short_name(&self) -> &'static str {
        "astroid_strike_part_two"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to one of the goals ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAIL_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        r#"// You'll need to read the safe direction from the data terminal
// (either "top", "middle", or "bottom") and then move the rover
// to the corresponding goal.
//
// ADD YOUR CODE BELOW
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![
            State {
                player: Player::new(1, 3, 10, Orientation::Right),
                fuel_spots: vec![],
                goals: vec![Goal::new(4, 0), Goal::new(7, 3), Goal::new(4, 6)],
                enemies: vec![],
                obstacles: [
                    self.obstacles().clone(),
                    vec![Obstacle::new(5, 3), Obstacle::new(4, 4)],
                ]
                .concat(),
                password_gates: vec![],
                data_terminals: vec![DataTerminal::new(0, 3, "top".into())],
                telepads: vec![],
            },
            State {
                player: Player::new(1, 3, 10, Orientation::Right),
                fuel_spots: vec![],
                goals: vec![Goal::new(4, 0), Goal::new(7, 3), Goal::new(4, 6)],
                enemies: vec![],
                obstacles: [
                    self.obstacles().clone(),
                    vec![Obstacle::new(4, 2), Obstacle::new(4, 4)],
                ]
                .concat(),
                password_gates: vec![],
                data_terminals: vec![DataTerminal::new(0, 3, "middle".into())],
                telepads: vec![],
            },
            State {
                player: Player::new(1, 3, 10, Orientation::Right),
                fuel_spots: vec![],
                goals: vec![Goal::new(4, 0), Goal::new(7, 3), Goal::new(4, 6)],
                enemies: vec![],
                obstacles: [
                    self.obstacles().clone(),
                    vec![Obstacle::new(4, 2), Obstacle::new(5, 3)],
                ]
                .concat(),
                password_gates: vec![],
                data_terminals: vec![DataTerminal::new(0, 3, "bottom".into())],
                telepads: vec![],
            },
        ]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some(
            "Don't use the read_data function. (Check the function list for something that might help).",
        )
    }
    fn check_challenge(&self, _states: &Vec<State>, script: &str, _stats: &ScriptStats) -> bool {
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
    use crate::{constants::ERR_OUT_OF_FUEL, levels::Outcome};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &AstroidStrikePartTwo {};

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
            move_forward(3);
            if safe_direction == "top" {
                turn_left();
            }
            if safe_direction == "bottom" {
                turn_right();
            }
            move_forward(3);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Hard-coding the movement direction should always result in failure.
        // In this specific case, it should be Outcome::Continue because we didn't
        // run out of fuel, but we didn't reach the goal either.
        let script = r"move_forward(6);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r"move_forward(3);
            turn_right();
            move_forward(3);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r"move_forward(3);
        turn_left();
        move_forward(3);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &AstroidStrikePartTwo {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r#"
            let safe_direction = read_data();
            move_forward(3);
            if safe_direction == "top" {
                turn_left();
            }
            if safe_direction == "bottom" {
                turn_right();
            }
            move_forward(3);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, false);

        // This code doesn't beat the level because the rover runs out
        // of fuel.
        let script = r"
            move_forward(6);
            turn_left();
            move_forward(3);
            turn_right();
            turn_right();
            move_forward(3);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        );
        assert_eq!(result.passes_challenge, false);

        // This code should beat the level and pass the challenge.
        let script = r"
            fn try_move_forward(n) {
                // Record the current position and try moving forward one space.
                let pos = get_position();
                move_forward(1);
                // Check the new position. If we're blocked, then the new position
                // will be the same as the old.
                let new_pos = get_position();
                if pos == new_pos {
                // In this case, return early (i.e. don't keep trying to move).
                return;
                }
                // Otherwise, we're not blocked. Keep moving the remaining
                // number of spaces.
                move_forward(n-1);
            }

            move_forward(3);
            try_move_forward(3);
            turn_left();
            try_move_forward(3);
            turn_right();
            turn_right();
            try_move_forward(3);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, true);
    }
}
