use crate::constants::MAX_FUEL;
use crate::levels::{Level, Outcome};
use crate::simulation::{Actor, Player, State};

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
// The "say" function makes the rover say something. Try changing
// the code to see all the things the rover can say!

say("Hello, world!");
say(2 + 2);
say(5 < 10);
say(7 > 8);
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
        vec!["Comment", "Function"]
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
