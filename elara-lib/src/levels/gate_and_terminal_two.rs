use super::{std_check_win, Level, Outcome, AVAIL_FUNCS_WITH_READ};
use crate::simulation::{
    Actor, DataTerminal, Goal, Obstacle, Orientation, PasswordGate, Player, Pos, State,
};

#[derive(Copy, Clone)]
pub struct GateAndTerminalPartTwo {}

impl Level for GateAndTerminalPartTwo {
    fn name(&self) -> &'static str {
        "Needle in a Haystack"
    }
    fn short_name(&self) -> &'static str {
        "gate_and_terminal_part_two"
    }
    fn objective(&self) -> &'static str {
        "Try the other data terminals ({terminal}) to find the right password, then move the rover ({robot}) to the goal ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAIL_FUNCS_WITH_READ
    }
    fn initial_code(&self) -> &'static str {
        r#"// This code reads the data from the closest data terminal and
// tries using it as the password. However, it looks like it
// isn't the right password. Try the other terminals?
//
// CHANGE THE CODE BELOW
let password = read_data();
move_forward(1);
say(password);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(1, 0, 20, Orientation::Down);
        state.goal = Some(Goal {
            pos: Pos { x: 4, y: 1 },
        });
        state.obstacles = vec![
            Obstacle::new(2, 0),
            Obstacle::new(2, 2),
            Obstacle::new(2, 3),
            Obstacle::new(0, 3),
            Obstacle::new(1, 3),
            Obstacle::new(2, 3),
        ];
        state.password_gates = vec![PasswordGate::new(2, 1, "vaughan".to_string(), false)];
        state.data_terminals = vec![
            DataTerminal::new(0, 0, "carver".to_string()),
            DataTerminal::new(0, 1, "curie".to_string()),
            DataTerminal::new(0, 2, "vaughan".to_string()),
        ];
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
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &GateAndTerminalPartTwo {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_forward(2);
            let password = read_data();
            turn_left();
            turn_left();
            move_forward(1);
            say(password);
            turn_right();
            move_forward(3);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
