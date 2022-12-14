use super::{no_objective_check_win, Level, Outcome};
use crate::simulation::{Actor, State};

#[derive(Copy, Clone)]
pub struct Variables {}

impl Level for Variables {
    fn name(&self) -> &'static str {
        "Variety is the Spice of Life"
    }
    fn short_name(&self) -> &'static str {
        "variables"
    }
    fn objective(&self) -> &'static str {
        "Learn about and experiment with variables."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Variables are used to store values. For example, this creates
// a variable named "greeting" which holds the value "Hello!"
let greeting = "Hello!";
say(greeting);

// You also can change the value that a variable holds. You don't
// need to use the `let` keyword again if the variable
// already exists.
let number = 5;
say(number);
number = number + 1;
say(number);

// If a function has an output, you can assign that output to
// a variable.
let random_number = random();
say(random_number);
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
        const LEVEL: &'static dyn Level = &Variables {};

        // Running the initial code should result in Outcome::NoObjective.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
    }
}
