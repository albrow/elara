use super::{std_check_win, Level, Outcome};
use crate::{
    script_runner::ScriptStats,
    simulation::{Actor, FuelSpot, Goal, Obstacle, Orientation, Player, Pos, State},
};

#[derive(Copy, Clone)]
pub struct ReimplementTurnRight {}

lazy_static! {
    static ref AVAILABLE_FUNCS: Vec<&'static str> = vec!["move_backward", "turn_left", "say"];
}

impl Level for ReimplementTurnRight {
    fn name(&self) -> &'static str {
        "Three Lefts Make a Right"
    }
    fn short_name(&self) -> &'static str {
        "reimplement_turn_right"
    }
    fn objective(&self) -> &'static str {
        "Finish defining the new_turn_right function, then move the rover ({robot}) to the goal ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAILABLE_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        r"fn new_turn_right() {
  // ADD YOUR CODE HERE
  
}

// Using the new_turn_right function, this code will move
// the rover all the way to the goal! If you did it right,
// you DON'T need to change the following code.
move_backward(4);
new_turn_right();
move_backward(4);
new_turn_right();
move_backward(3);
new_turn_right();
move_backward(2);
new_turn_right();
move_backward(1);
"
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 0, 10, Orientation::Left);
        state.goal = Some(Goal {
            pos: Pos { x: 2, y: 2 },
        });
        state.obstacles = vec![
            Obstacle::new(0, 1),
            Obstacle::new(0, 2),
            Obstacle::new(0, 3),
            Obstacle::new(0, 4),
            Obstacle::new(0, 5),
            Obstacle::new(1, 1),
            Obstacle::new(1, 5),
            Obstacle::new(2, 1),
            Obstacle::new(2, 3),
            Obstacle::new(2, 5),
            Obstacle::new(3, 1),
            Obstacle::new(3, 2),
            Obstacle::new(3, 3),
            Obstacle::new(3, 5),
            Obstacle::new(4, 5),
            Obstacle::new(5, 0),
            Obstacle::new(5, 1),
            Obstacle::new(5, 2),
            Obstacle::new(5, 3),
            Obstacle::new(5, 4),
            Obstacle::new(5, 5),
        ];
        state.fuel_spots = vec![FuelSpot::new(2, 4)];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Code length must be 68 characters or less.")
    }
    fn check_challenge(&self, _states: &Vec<State>, _script: &str, stats: &ScriptStats) -> bool {
        stats.code_len <= 68
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{constants::ERR_OUT_OF_FUEL, levels::Outcome};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &ReimplementTurnRight {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        );

        // This is an example solution that should result in Outcome::Success.
        let script = r"
            fn new_turn_right() {
                turn_left();
                turn_left();
                turn_left();
            }

            move_backward(4);
            new_turn_right();
            move_backward(4);
            new_turn_right();
            move_backward(3);
            new_turn_right();
            move_backward(2);
            new_turn_right();
            move_backward(1);
        ";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &ReimplementTurnRight {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r"
            fn new_turn_right() {
                turn_left();
                turn_left();
                turn_left();
            }

            move_backward(4);
            new_turn_right();
            move_backward(4);
            new_turn_right();
            move_backward(3);
            new_turn_right();
            move_backward(2);
            new_turn_right();
            move_backward(1);
        ";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, false);

        // This code satisfies the challenge conditions.
        let script = r#"
            fn l() { turn_left(); }
            fn r() {
                l();
                l();
                l();
            }
            loop {
                move_backward(4);
                r();
            }"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, true);
    }
}
