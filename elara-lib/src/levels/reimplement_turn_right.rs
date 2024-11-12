use super::{std_check_win, Level, Outcome};
use crate::{
    script_runner::ScriptStats,
    simulation::{Actor, EnergyCell, Goal, Obstacle, Orientation, Player, State},
};

#[derive(Copy, Clone)]
pub struct ReimplementTurnRight {}

lazy_static! {
    static ref DISABLED_FUNCS: Vec<&'static str> = vec!["move_forward", "turn_right"];
}

impl Level for ReimplementTurnRight {
    fn name(&self) -> &'static str {
        "How to Make a Right"
    }
    fn short_name(&self) -> &'static str {
        "reimplement_turn_right"
    }
    fn objective(&self) -> &'static str {
        "Use the `three_lefts` function to reach the goal ({goal})."
    }
    fn disabled_functions(&self) -> &'static Vec<&'static str> {
        &DISABLED_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        r#"// This function "turns right" by turning left three times.
fn three_lefts() {
  // ADD YOUR CODE HERE
  
}

// Using the three_lefts function, this code will move
// the rover all the way to the goal! If you did it right,
// you DON'T need to change the following code.
move_backward(4);
three_lefts();
move_backward(4);
three_lefts();
move_backward(3);
three_lefts();
move_backward(2);
three_lefts();
move_backward(1);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 0, 10, Orientation::Left);
        state.goals = vec![Goal::new(2, 2)];
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
        state.energy_cells = vec![EnergyCell::new(2, 4)];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Code length must be 55 or less.")
    }
    fn check_challenge(&self, _states: &[State], _script: &str, stats: &ScriptStats) -> bool {
        stats.code_len <= 55
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{constants::ERR_OUT_OF_ENERGY, levels::Outcome};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &ReimplementTurnRight {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        );

        // This is an example solution that should result in Outcome::Success.
        let script = r"
            fn three_lefts() {
                turn_left();
                turn_left();
                turn_left();
            }

            move_backward(4);
            three_lefts();
            move_backward(4);
            three_lefts();
            move_backward(3);
            three_lefts();
            move_backward(2);
            three_lefts();
            move_backward(1);
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &ReimplementTurnRight {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r"
            fn three_lefts() {
                turn_left();
                turn_left();
                turn_left();
            }

            move_backward(4);
            three_lefts();
            move_backward(4);
            three_lefts();
            move_backward(3);
            three_lefts();
            move_backward(2);
            three_lefts();
            move_backward(1);
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r#"
            fn l() { turn_left(); }
            loop {
                move_backward(4);
                l();
                l();
                l();
            }"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
