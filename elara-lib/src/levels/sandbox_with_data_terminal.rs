use super::{no_objective_check_win, Level, Outcome};
use crate::{
    constants::MAX_FUEL,
    simulation::{Actor, DataTerminal, Orientation, Player, State},
};

lazy_static! {
    // For now the sandbox level supports all needed functions.
    // TODO(albrow): Can we change this based on which journal page is being viewed?
    static ref SANDBOX_AVAIL_FUNCS: Vec<&'static str> = vec![
        "move_forward",
        "move_backward",
        "turn_left",
        "turn_right",
        "say",
        "read_data",
        "get_orientation",
        // "get_pos",
    ];
}

#[derive(Copy, Clone)]
/// Sandbox is a special level which does not have an explicit objective. It can
/// be used in runnable examples or for players to explore and experiment on
/// their own.
pub struct SandboxWithDataTerminal {}

impl Level for SandboxWithDataTerminal {
    fn name(&self) -> &'static str {
        "Sandbox"
    }
    fn short_name(&self) -> &'static str {
        "sandbox_with_data_terminal"
    }
    fn objective(&self) -> &'static str {
        "Write whatever code you want :)"
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &SANDBOX_AVAIL_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        // Note(albrow): Typically the initial code would be provided in the UI.
        // E.g. for a runnable example, we would start with the corresponding example
        // code.
        ""
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 0, 50, Orientation::Right);
        state.data_terminals = vec![DataTerminal::new(1, 0, "bananas".to_string())];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        no_objective_check_win(state)
    }
    fn bounds(&self) -> crate::actors::Bounds {
        // For the sandbox level, we allow the player to move in any direction
        // until they run out of fuel.
        crate::actors::Bounds {
            min_x: -(MAX_FUEL as i32),
            max_x: MAX_FUEL as i32,
            min_y: -(MAX_FUEL as i32),
            max_y: MAX_FUEL as i32,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &SandboxWithDataTerminal {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // We should be able to read from the data terminal.
        let script = "say(read_data());";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
        assert_eq!(result.states.last().unwrap().player.message, "bananas");
    }
}
