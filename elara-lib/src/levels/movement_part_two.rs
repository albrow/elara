use super::{std_check_win, Level, Outcome};
use crate::{
    script_runner::ScriptStats,
    simulation::{Actor, Goal, Obstacle, Orientation, Player, State},
};

#[derive(Copy, Clone)]
pub struct MovementPartTwo {}

impl Level for MovementPartTwo {
    fn name(&self) -> &'static str {
        "Overcoming Obstacles"
    }
    fn short_name(&self) -> &'static str {
        "movement_part_two"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// G.R.O.V.E.R. can't move through obstacles (like rocks and walls).
// Try moving around the obstacles instead!

// ADD YOUR CODE BELOW
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(8, 7, 20, Orientation::Right);
        state.goals = vec![Goal::new(8, 4)];
        state.obstacles = vec![
            Obstacle::new(7, 3),
            Obstacle::new(7, 4),
            Obstacle::new(7, 5),
            Obstacle::new(7, 6),
            Obstacle::new(7, 7),
            Obstacle::new(8, 3),
            Obstacle::new(8, 5),
            Obstacle::new(9, 3),
            Obstacle::new(9, 5),
            Obstacle::new(9, 6),
            Obstacle::new(10, 3),
            Obstacle::new(10, 5),
            Obstacle::new(10, 6),
            Obstacle::new(11, 3),
        ];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Code length must be 40 characters or less.")
    }
    fn check_challenge(&self, _states: &[State], _script: &str, stats: &ScriptStats) -> bool {
        stats.code_len <= 40
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &MovementPartTwo {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r"move_forward(3);
            turn_left();
            move_forward(3);
            turn_left();
            move_forward(3);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &MovementPartTwo {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r"
            move_forward(3);
            turn_left();
            move_forward(3);
            turn_left();
            move_forward(3);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions, but doesn't beat the
        // level. passes_challenge should be false.
        let script = r"
            move_forward(3);
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r"
            loop {
                move_forward(3);
                turn_left();
            }";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
