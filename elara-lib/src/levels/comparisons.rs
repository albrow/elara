use super::{no_objective_check_win, Level, Outcome};
use crate::simulation::{Actor, State};

#[derive(Copy, Clone)]
pub struct Comparisons {}

impl Level for Comparisons {
    fn name(&self) -> &'static str {
        "Apples and Oranges"
    }
    fn short_name(&self) -> &'static str {
        "comparisons"
    }
    fn objective(&self) -> &'static str {
        "Call the \"say\" function with different comparison expressions."
    }
    fn initial_code(&self) -> &'static str {
        r#"// A "comparison expression" can be used to compare two different
// values. A comparison expression always results in a boolean
// value (either true or false).
say(5 > 3);
say(3 < 1);

// The "equals" operator tells us if two things are equal. Note
// that when checking for equality, you need to use two equals
// signs ("==") instead of one. This works for strings too.
say(0 == 1);
say("love" == "love");

// The "not equals" operator is the opposite of "equals". It
// tells us if two things are *not* equal.
say("apples" != "oranges");

// You can also combine comparison expressions and math expressions.
say(2 + 2 == 4);
say(2 + 2 == 5);
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
        const LEVEL: &'static dyn Level = &Comparisons {};

        // Running the initial code should result in Outcome::NoObjective.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
    }
}
