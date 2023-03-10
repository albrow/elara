use super::{std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, FuelSpot, Goal, Obstacle, Orientation, PasswordGate, Player, Pos, State,
};

#[derive(Copy, Clone)]
pub struct VariablesIntro {}

const PASSWORD: &'static str = "supercalifragilisticexpialidocious";

impl Level for VariablesIntro {
    fn name(&self) -> &'static str {
        "The Spice of Life"
    }
    fn short_name(&self) -> &'static str {
        "variables_intro"
    }
    fn objective(&self) -> &'static str {
        "Use a variable to open the locked gates ({gate}), then move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// There are several gates ahead with the same password. Instead of
// typing this super long password over and over again, you can
// store it in a variable.
let password = "supercalifragilisticexpialidocious";

// Now you can use the variable instead of typing the password.
// ADD YOUR CODE BELOW

"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(5, 7, 6, Orientation::Up);
        state.goal = Some(Goal {
            pos: Pos { x: 9, y: 3 },
        });
        state.obstacles = vec![
            Obstacle::new(2, 2),
            Obstacle::new(2, 3),
            Obstacle::new(2, 4),
            Obstacle::new(3, 2),
            Obstacle::new(3, 4),
            Obstacle::new(4, 2),
            Obstacle::new(4, 4),
            Obstacle::new(4, 5),
            Obstacle::new(4, 6),
            Obstacle::new(4, 7),
            Obstacle::new(5, 2),
            Obstacle::new(6, 2),
            Obstacle::new(6, 4),
            Obstacle::new(6, 5),
            Obstacle::new(6, 6),
            Obstacle::new(6, 7),
            Obstacle::new(7, 2),
            Obstacle::new(7, 4),
            Obstacle::new(8, 2),
            Obstacle::new(8, 4),
            Obstacle::new(9, 2),
            Obstacle::new(9, 4),
            Obstacle::new(10, 2),
            Obstacle::new(10, 3),
            Obstacle::new(10, 4),
        ];
        state.fuel_spots = vec![FuelSpot::new(3, 3)];
        state.password_gates = vec![
            PasswordGate::new(5, 6, PASSWORD.to_string(), false),
            PasswordGate::new(5, 4, PASSWORD.to_string(), false),
            PasswordGate::new(4, 3, PASSWORD.to_string(), false),
        ];
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
    use crate::constants::ERR_OUT_OF_FUEL;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &VariablesIntro {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            let password = "supercalifragilisticexpialidocious";
            say(password);
            move_forward(2);
            say(password);
            move_forward(2);
            say(password);
            turn_left();
            move_forward(2);
            move_backward(6);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Attempting to reach the goal without collecting the fuel on
        // the way should result in running out of fuel.
        let script = r#"
            let password = "supercalifragilisticexpialidocious";
            say(password);
            move_forward(2);
            say(password);
            move_forward(2);
            turn_right();
            move_forward(4);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        );
    }
}
