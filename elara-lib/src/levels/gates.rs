use super::{std_check_win, Level, Outcome};
use crate::{
    script_runner::ScriptStats,
    simulation::{Actor, GateVariant, Goal, Obstacle, Orientation, PasswordGate, Player, State},
};

#[derive(Copy, Clone)]
pub struct Gates {}

impl Level for Gates {
    fn name(&self) -> &'static str {
        "Open Sesame"
    }
    fn short_name(&self) -> &'static str {
        "gates"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// First, we move G.R.O.V.E.R. next to the password gate.
move_forward(2);

// Then, you just need to say the password.
// Reminder: the password for this gate is "lovelace".
// ADD YOUR CODE BELOW
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 3, 10, Orientation::Right);
        state.goals = vec![Goal::new(7, 3)];
        state.obstacles = vec![
            Obstacle::new(3, 0),
            Obstacle::new(3, 1),
            Obstacle::new(3, 2),
            Obstacle::new(3, 4),
            Obstacle::new(3, 5),
            Obstacle::new(3, 6),
            Obstacle::new(3, 7),
        ];
        state.password_gates = vec![PasswordGate::new_with_info(
            3,
            3,
            "lovelace".to_string(),
            false,
            GateVariant::NESW,
            r#"The password for this gate is `"lovelace"`."#.to_string(),
        )];
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
    use crate::constants::ERR_OUT_OF_ENERGY;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &Gates {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"move_forward(2); say("lovelace"); move_forward(5);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Attempting to reach the goal without saying the password should
        // result in running out of energy.
        let script = "loop { move_forward(1); }";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        );

        // Saying the wrong password should not open the gate.
        let script = r#"move_forward(2); say("wrong password"); move_forward(5);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Saying the password when not next to the gate should not
        // open it.
        let script = r#"say("lovelace"); move_forward(2); move_forward(5);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Saying the password again, should close the gate, meaning we
        // can't reach the goal.
        let script = r#"move_forward(2); say("lovelace"); say("lovelace"); move_forward(5);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Saying the password 3x, should result in the gate being open again.
        let script = r#"move_forward(2); say("lovelace"); say("lovelace"); say("lovelace"); move_forward(5);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &Gates {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r#"
            move_forward(2);
            say("lovelace");
            move_forward(5);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r#"
            loop {
                move_forward(2);
                say("lovelace");
            }"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
