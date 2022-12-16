use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, DataTerminal, Goal, Obstacle, PasswordGate, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct GateAndTerminal {}

impl Level for GateAndTerminal {
    fn name(&self) -> &'static str {
        "Forgotten Password"
    }
    fn short_name(&self) -> &'static str {
        "gate_and_terminal"
    }
    fn objective(&self) -> &'static str {
        "Get the password from the data terminal ({terminal}), unlock the gate ({gate}), then move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// There's another locked gate, but this time I don't
// remember the password. You'll need to read it from
// the nearby data terminal.
move_down(1);
move_left(1);

// The "read_data" function outputs the data from a
// nearby data terminal. In this case, you can use
// it to get the password, then store it in a variable
// called "password".
let password = read_data();

// Add some code below to move to the gate,
// unlock it, and then move to the goal...
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::ERR_NO_DATA_TERMINAL;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &GateAndTerminal {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
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
            .run_player_script_internal(script.to_string(), LEVEL)
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
        let result = game.run_player_script_internal(script.to_string(), LEVEL);
        assert!(result.is_err());
        assert!(result
            .err()
            .unwrap()
            .to_string()
            .contains(ERR_NO_DATA_TERMINAL));
    }
}
