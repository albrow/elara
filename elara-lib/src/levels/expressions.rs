use super::{no_objective_check_win, Level, Outcome};
use crate::simulation::{Actor, State};

#[derive(Copy, Clone)]
pub struct Expressions {}

impl Level for Expressions {
    fn name(&self) -> &'static str {
        "Express Yourself"
    }
    fn short_name(&self) -> &'static str {
        "expressions"
    }
    fn objective(&self) -> &'static str {
        "Call the \"say\" function with different types of expressions."
    }
    fn initial_code(&self) -> &'static str {
        r#"// An "expression" is either a value (e.g. a number like `42`) or
// something that results in a value (e.g. an addition operation
// like `2 + 3`). Let's look at some simple expressions using the
// "say" function.

// A "string" is just a piece of text surrounded by double quotes.
say("This is a string");

// An "integer" is just a whole number and can be positive or
// negative.
say(42);
say(-9);

// A "boolean" is either true or false. Note that boolean values
// are not surrounded by quotes.
say(true);
say(false);
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &Expressions {};

        // Running the initial code should result in Outcome::NoObjective.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
    }
}
