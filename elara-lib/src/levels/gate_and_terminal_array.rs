use super::{std_check_win, Level, Outcome, AVAIL_FUNCS_WITH_READ};
use crate::simulation::{
    Actor, DataTerminal, Goal, Obstacle, Orientation, PasswordGate, Player, Pos, State,
};

#[derive(Copy, Clone)]
pub struct GateAndTerminalArray {}

impl Level for GateAndTerminalArray {
    fn name(&self) -> &'static str {
        "Using Arrays (TBD)"
    }
    fn short_name(&self) -> &'static str {
        "gate_and_terminal_array"
    }
    fn objective(&self) -> &'static str {
        "Get the password from the data terminal ({terminal}), unlock the gate ({gate}), then move the rover ({robot}) to the goal ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAIL_FUNCS_WITH_READ
    }
    fn initial_code(&self) -> &'static str {
        r#"
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
        state.data_terminals = vec![DataTerminal::new(4, 1, "turing".into())];
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
        const LEVEL: &'static dyn Level = &GateAndTerminalArray {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // TODO(albrow): Test success case.
    }
}
