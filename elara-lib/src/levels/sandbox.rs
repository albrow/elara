use super::{no_objective_check_win, Level, Outcome};
use crate::simulation::{Actor, State};

#[derive(Copy, Clone)]
/// Sandbox is a special level which does not have an explicit objective. It can
/// be used in runnable examples or for players to explore and experiment on
/// their own.
pub struct Sandbox {}

impl Level for Sandbox {
    fn name(&self) -> &'static str {
        "Sandbox"
    }
    fn short_name(&self) -> &'static str {
        "sandbox"
    }
    fn objective(&self) -> &'static str {
        "Write whatever code you want :)"
    }
    fn initial_code(&self) -> &'static str {
        // Note(albrow): Typically the initial code would be provided in the UI.
        // E.g. for a runnable example, we would start with the corresponding example
        // code.
        ""
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State::new()]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        no_objective_check_win(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &Sandbox {};

        // Running the initial code should result in Outcome::NoObjective.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
    }
}
