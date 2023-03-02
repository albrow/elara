use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, FuelSpot, Goal, Obstacle, Orientation, Player, Pos, State};

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
        "Create a new turn_right function, then move the rover ({robot}) to the goal ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAILABLE_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        r"fn turn_right() {
  // ADD YOUR CODE HERE
  
}

// Using the new turn_right function, this code will move
// the rover all the way to the goal! If you did it right,
// you DON'T need to change the following code.
move_backward(4);
turn_right();
move_backward(4);
turn_right();
move_backward(3);
turn_right();
move_backward(2);
turn_right();
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &ReimplementTurnRight {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // This is an example solution that should result in Outcome::Success.
        let script = r"
            turn_left();
            turn_left();
            move_backward(3);
            turn_left();
            move_backward(3);
        ";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Trying to use move_forward or turn_right should result in
        // an error.
        let script = r"
            move_forward(3);
            turn_left();
            move_forward(3);
        ";
        let result = game.run_player_script_internal(script.to_string(), LEVEL);
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("move_forward"));

        let script = r"turn_right();";
        let result = game.run_player_script_internal(script.to_string(), LEVEL);
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("turn_right"));
    }
}