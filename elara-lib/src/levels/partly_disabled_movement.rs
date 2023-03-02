use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, Goal, Obstacle, Orientation, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct PartlyDisabledMovement {}

lazy_static! {
    static ref PARTLY_DISABLED_MOVEMENT_FUNCS: Vec<&'static str> =
        vec!["move_backward", "turn_left",];
}

impl Level for PartlyDisabledMovement {
    fn name(&self) -> &'static str {
        "Impaired Movement"
    }
    fn short_name(&self) -> &'static str {
        "partly_disabled_movement"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &PARTLY_DISABLED_MOVEMENT_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        r#"// Can you navigate to the goal using only the move_backward
// and turn_left functions?
//
// ADD YOUR CODE BELOW
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 7, 10, Orientation::Right);
        state.goal = Some(Goal {
            pos: Pos { x: 3, y: 4 },
        });
        state.obstacles = vec![
            Obstacle::new(0, 3),
            Obstacle::new(1, 3),
            Obstacle::new(2, 3),
            Obstacle::new(3, 3),
            Obstacle::new(4, 3),
            Obstacle::new(4, 4),
            Obstacle::new(4, 5),
            Obstacle::new(4, 6),
            Obstacle::new(4, 7),
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
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &PartlyDisabledMovement {};

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
        game.run_player_script_internal(script.to_string(), LEVEL)
            .expect_err("Using move_forward should be an error");

        let script = r"turn_right();";
        game.run_player_script_internal(script.to_string(), LEVEL)
            .expect_err("Using turn_right should be an error");
    }
}
