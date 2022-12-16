use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, Goal, Obstacle, PasswordGate, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct Gates {}

impl Level for Gates {
    fn name(&self) -> &'static str {
        "Let Me In"
    }
    fn short_name(&self) -> &'static str {
        "gates"
    }
    fn objective(&self) -> &'static str {
        "Open the locked gate ({gate}), then move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Looks like a locked gate is blocking the way! To open the
// gate, move the rover next to it, then say the password using
// the "say" function. The password for this gate is "lovelace".

move_right(2);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 3, 10);
        state.goal = Some(Goal {
            pos: Pos { x: 7, y: 3 },
        });
        state.obstacles = vec![
            Obstacle::new(3, 0),
            Obstacle::new(3, 1),
            Obstacle::new(3, 2),
            Obstacle::new(3, 4),
            Obstacle::new(3, 5),
            Obstacle::new(3, 6),
            Obstacle::new(3, 7),
        ];
        state.password_gates = vec![PasswordGate::new(3, 3, "lovelace".to_string(), false)];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::ERR_OUT_OF_FUEL;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &Gates {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"move_right(2); say("lovelace"); move_right(5);"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Attempting to reach the goal without saying the password should
        // result in running out of fuel.
        let script = "loop { move_right(1); }";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        );

        // Saying the wrong password should not open the gate.
        let script = r#"move_right(2); say("wrong password"); move_right(5);"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Saying the password when not next to the gate should not
        // open it.
        let script = r#"say("lovelace"); move_right(2); move_right(5);"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Saying the password again, should close the gate, meaning we
        // can't reach the goal.
        let script = r#"move_right(2); say("lovelace"); say("lovelace"); move_right(5);"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Saying the password 3x, should result in the gate being open again.
        let script =
            r#"move_right(2); say("lovelace"); say("lovelace"); say("lovelace"); move_right(5);"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
