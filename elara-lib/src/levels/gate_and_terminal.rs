use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, DataTerminal, Goal, Obstacle, PasswordGate, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct GateAndTerminal {}

impl Level for GateAndTerminal {
    fn name(&self) -> &'static str {
        "What's the Password?"
    }
    fn objective(&self) -> &'static str {
        "Get the password from the data terminal (📺), unlock the gate (🔒), then move the rover (🤖) to the goal (🏁)."
    }
    fn initial_code(&self) -> &'static str {
        r#"//
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(5, 0, 10);
        state.goal = Some(Goal {
            pos: Pos { x: 5, y: 5 },
        });
        state.obstacles = vec![
            Obstacle::new(3, 0),
            Obstacle::new(3, 2),
            Obstacle::new(3, 3),
            Obstacle::new(4, 3),
            Obstacle::new(6, 3),
            Obstacle::new(7, 3),
            Obstacle::new(7, 0),
            Obstacle::new(7, 1),
            Obstacle::new(7, 2),
        ];
        state.password_gates = vec![PasswordGate::new(5, 3, "turing".to_string(), false)];
        state.data_terminals = vec![DataTerminal::new(3, 1, "turing".to_string())];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn new_core_concepts(&self) -> Vec<&'static str> {
        vec!["Variables"]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::ERR_NO_DATA_TERMINAL;
    use crate::levels::level_index_by_name;
    use crate::levels::Outcome;
    use crate::levels::LEVELS;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        let level_index = level_index_by_name(GateAndTerminal {}.name());

        // Running the initial code should result in Outcome::Continue.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_down(1);
            move_left(1);
            let password = read_data();
            move_right(1);
            move_down(1);
            say(password);
            move_down(3);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        // Regression check for a bug where read_data was not correctly
        // adding a position to result.positions, resulting in a length
        // mismatch.
        assert_eq!(result.states.len(), result.positions.len());

        // Calling read_data when we are not next to a data terminal
        // should result in an error.
        let script = r#"
            let password = read_data();
        "#;
        let result = game.run_player_script_internal(script.to_string(), level_index);
        assert!(result.is_err());
        assert!(result
            .err()
            .unwrap()
            .to_string()
            .contains(ERR_NO_DATA_TERMINAL));
    }
}
