use super::{std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, DataTerminal, Goal, Obstacle, Orientation, PasswordGate, Player, Pos, State,
};

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
        r#"move_forward(1);

// This code reads the password from the data terminal and
// stores it in a variable called the_password. (You don't
// need to change this part).
let the_password = read_data();

// Now you just need to unlock the gate and move to the goal.
// ADD YOUR CODE BELOW

"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(5, 0, 10, Orientation::Down);
        state.goal = Some(Goal {
            pos: Pos { x: 5, y: 5 },
        });
        state.obstacles = vec![
            Obstacle::new(4, 0),
            Obstacle::new(4, 2),
            Obstacle::new(4, 3),
            Obstacle::new(6, 3),
            Obstacle::new(6, 0),
            Obstacle::new(6, 1),
            Obstacle::new(6, 2),
        ];
        state.password_gates = vec![PasswordGate::new(5, 3, "turing".to_string(), false)];
        state.data_terminals = vec![DataTerminal::new(4, 1, "turing".to_string())];
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
            move_forward(1);
            let the_password = read_data();
            move_forward(1);
            say(the_password);
            move_forward(3);
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
