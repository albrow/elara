use crate::constants::MAX_FUEL;
use crate::levels::{Level, Outcome};
use crate::simulation::{Actor, Player, State};

#[derive(Copy, Clone)]
pub struct Comparisons {}

impl Level for Comparisons {
    fn name(&self) -> &'static str {
        "Apples and Oranges"
    }
    fn objective(&self) -> &'static str {
        "Call the \"say\" function with different comparison operators."
    }
    fn initial_code(&self) -> &'static str {
        r#"// A "comparison operator" can be used to compare two different
// values. They are similar to mathematical operators, but instead
// of producing numbers, they produce true or false.
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

// You can also combine comparison operators and math operators.
say(2 + 2 == 4);
say(2 + 2 == 5);
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
        vec![]
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
        let level_index = level_index_by_name(Comparisons {}.name());

        // Running the initial code should result in Outcome::NoObjective.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
    }
}
