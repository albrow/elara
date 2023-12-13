use super::{std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, EnergyCell, GateVariant, Goal, Obstacle, Orientation, PasswordGate, Player, State,
};

#[derive(Copy, Clone)]
pub struct VariablesIntro {}

const PASSWORD: &str = "supercalifragilisticexpialidocious";
const GATE_INFO: &str =
    r#"The starting code includes the password for this gate as a variable named `password`."#;

impl Level for VariablesIntro {
    fn name(&self) -> &'static str {
        "The Spice of Life"
    }
    fn short_name(&self) -> &'static str {
        "variables_intro"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// There are several gates ahead with the same password. Instead of
// typing this super long password over and over again, you can
// store it in a variable.
let password = "supercalifragilisticexpialidocious";

// Now you can use the variable instead of typing the password.
// ADD YOUR CODE BELOW

"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(5, 7, 7, Orientation::Up);
        state.goals = vec![Goal::new(9, 3)];
        state.obstacles = vec![
            Obstacle::new(2, 2),
            Obstacle::new(2, 3),
            Obstacle::new(2, 4),
            Obstacle::new(3, 2),
            Obstacle::new(3, 4),
            Obstacle::new(4, 0),
            Obstacle::new(4, 1),
            Obstacle::new(4, 2),
            Obstacle::new(4, 4),
            Obstacle::new(4, 5),
            Obstacle::new(4, 6),
            Obstacle::new(4, 7),
            Obstacle::new(6, 0),
            Obstacle::new(6, 1),
            Obstacle::new(6, 2),
            Obstacle::new(6, 4),
            Obstacle::new(6, 5),
            Obstacle::new(6, 6),
            Obstacle::new(7, 2),
            Obstacle::new(7, 4),
            Obstacle::new(7, 6),
            Obstacle::new(8, 2),
            Obstacle::new(8, 4),
            Obstacle::new(8, 6),
            Obstacle::new(9, 2),
            Obstacle::new(9, 4),
            Obstacle::new(9, 6),
            Obstacle::new(9, 7),
            Obstacle::new(10, 2),
            Obstacle::new(10, 3),
            Obstacle::new(10, 4),
        ];
        state.energy_cells = vec![
            EnergyCell::new(3, 3),
            EnergyCell::new(8, 7),
            EnergyCell::new(5, 0),
        ];
        state.password_gates = vec![
            PasswordGate::new_with_info(
                5,
                6,
                PASSWORD.to_string(),
                false,
                GateVariant::NWSE,
                GATE_INFO.into(),
            ),
            PasswordGate::new_with_info(
                5,
                4,
                PASSWORD.to_string(),
                false,
                GateVariant::NWSE,
                GATE_INFO.into(),
            ),
            PasswordGate::new_with_info(
                4,
                3,
                PASSWORD.to_string(),
                false,
                GateVariant::NESW,
                GATE_INFO.into(),
            ),
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
        Some("Reach the goal using 12 energy or less.")
    }
    fn check_challenge(
        &self,
        _states: &[State],
        _script: &str,
        stats: &crate::script_runner::ScriptStats,
    ) -> bool {
        stats.energy_used <= 12
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
        const LEVEL: &'static dyn Level = &VariablesIntro {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            let password = "supercalifragilisticexpialidocious";
            say(password);
            move_forward(2);
            say(password);
            move_forward(2);
            say(password);
            turn_left();
            move_forward(2);
            move_backward(6);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // An alternative solution.
        let script = r#"
                let password = "supercalifragilisticexpialidocious";
                turn_right();
                move_forward(3);
                move_backward(3);
                turn_left();
                say(password);
                move_forward(2);
                say(password);
                move_forward(2);
                turn_right();
                move_forward(4);
            "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // One more alternative solution.
        let script = r#"
                let password = "supercalifragilisticexpialidocious";
                say(password);
                move_forward(2);
                say(password);
                move_forward(5);
                move_backward(3);
                turn_right();
                move_forward(4);
            "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Attempting to reach the goal without collecting the energy
        // cell on the way should result in running out of energy.
        let script = r#"
            let password = "supercalifragilisticexpialidocious";
            say(password);
            move_forward(2);
            say(password);
            move_forward(2);
            turn_right();
            move_forward(4);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        );
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &VariablesIntro {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r#"
            let password = "supercalifragilisticexpialidocious";
            say(password);
            move_forward(2);
            say(password);
            move_forward(5);
            move_backward(3);
            turn_right();
            move_forward(4);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r#"
            let password = "supercalifragilisticexpialidocious";
            say(password);
            move_forward(2);
            say(password);
            move_forward(2);
            say(password);
            turn_left();
            move_forward(2);
            move_backward(6);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);

        // This code takes more steps, but still satisfies the challenge conditions.
        let script = r#"
                let password = "supercalifragilisticexpialidocious";
                say(password);
                move_forward(2);
                say(password);
                move_forward(2);
                say(password);
                turn_left();
                move_forward(2);
                turn_right();
                turn_right();
                move_forward(6);
            "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
