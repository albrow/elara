use crate::constants::MAX_FUEL;
use crate::levels::{Level, Outcome};
use crate::simulation::{Actor, Player, State};

#[derive(Copy, Clone)]
pub struct Expressions {}

impl Level for Expressions {
    fn name(&self) -> &'static str {
        "Express Yourself"
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
        vec![State {
            player: Player::new(0, 0, MAX_FUEL),
            fuel_spots: vec![],
            goal: None,
            enemies: vec![],
            obstacles: vec![],
        }]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, _state: &State) -> Outcome {
        Outcome::NoObjective
    }
    fn new_core_concepts(&self) -> Vec<&'static str> {
        vec!["Expressions", "Literals"]
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
        let level_index = level_index_by_name(Expressions {}.name());

        // Running the initial code should result in Outcome::NoObjective.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
    }
}
