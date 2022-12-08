use super::{no_objective_check_win, Level, Outcome};
use crate::simulation::{Actor, State};

#[derive(Copy, Clone)]
pub struct HelloWorld {}

impl Level for HelloWorld {
    fn name(&self) -> &'static str {
        "Hello World"
    }
    fn objective(&self) -> &'static str {
        "Use the \"say\" function to make the rover say something."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Any line that starts with "//" is a comment. Comments
// don't actually do anything; they're just helpful notes to
// help you understand the code :)
//
// The "say" function makes the rover say something. Click
// the "Run" button above to see what happens.

say("Hello, world!");
say("My name is G.R.O.V.E.R.");
"#
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
    fn new_core_concepts(&self) -> Vec<&'static str> {
        vec!["Comments"]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::LEVELS;
    use crate::levels::{level_index_by_name, Outcome};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        let level_index = level_index_by_name(HelloWorld {}.name());

        // Running the initial code should result in Outcome::NoObjective.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
    }
}
