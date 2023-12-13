use rhai::Engine;

use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, Goal, Obstacle, Orientation, Player, State, Telepad};
use crate::state_maker::StateMaker;

#[derive(Copy, Clone)]
pub struct TelepadPartOne {}

impl TelepadPartOne {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        vec![
            Obstacle::new(0, 3),
            Obstacle::new(0, 5),
            Obstacle::new(1, 3),
            Obstacle::new(1, 5),
            Obstacle::new(2, 3),
            Obstacle::new(2, 5),
            Obstacle::new(3, 3),
            Obstacle::new(3, 5),
            Obstacle::new(4, 3),
            Obstacle::new(4, 4),
            Obstacle::new(4, 5),
        ]
    }
}

impl Level for TelepadPartOne {
    fn name(&self) -> &'static str {
        "Unintended Effects"
    }
    fn short_name(&self) -> &'static str {
        "telepad_part_one"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// This code uses the get_orientation function to figure out which
// way the rover is facing. You DON'T need to change this part.
move_forward(3);
say("I am facing " + get_orientation());

// If the rover is facing up, turn to the right and then move
// forward. You DON'T need to change this part.
if get_orientation() == "up" {
  turn_right();
  move_forward(3);
}

// Add more if statements to handle the other possible orientations.
// ADD YOUR CODE BELOW
"#
    }

    fn initial_states(&self) -> Vec<State> {
        vec![
            StateMaker::new()
                .with_player(Player::new(0, 4, 10, Orientation::Right))
                .with_obstacles(self.obstacles().clone())
                .with_goals(vec![Goal::new(11, 4)])
                .with_telepads(vec![Telepad::new((3, 4), (8, 4), Orientation::Up)])
                .build(),
            StateMaker::new()
                .with_player(Player::new(0, 4, 10, Orientation::Right))
                .with_obstacles(self.obstacles().clone())
                .with_goals(vec![Goal::new(11, 4)])
                .with_telepads(vec![Telepad::new((3, 4), (8, 4), Orientation::Down)])
                .build(),
            StateMaker::new()
                .with_player(Player::new(0, 4, 10, Orientation::Right))
                .with_obstacles(self.obstacles().clone())
                .with_goals(vec![Goal::new(11, 4)])
                .with_telepads(vec![Telepad::new((3, 4), (8, 4), Orientation::Left)])
                .build(),
            StateMaker::new()
                .with_player(Player::new(0, 4, 10, Orientation::Right))
                .with_obstacles(self.obstacles().clone())
                .with_goals(vec![Goal::new(11, 4)])
                .with_telepads(vec![Telepad::new((3, 4), (8, 4), Orientation::Right)])
                .build(),
        ]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Have a code length of 165 or less and do not define any new functions.")
    }
    fn check_challenge(
        &self,
        _states: &[State],
        script: &str,
        stats: &crate::script_runner::ScriptStats,
    ) -> bool {
        if stats.code_len > 165 {
            return false;
        }
        // Script cannot contain the key word "fn".
        if let Ok(script) = Engine::new().compact_script(script) {
            let fn_regex = regex::Regex::new(r"\b(fn)\b").unwrap();
            return !fn_regex.is_match(script.as_str());
        }
        // Otherwise, challenge is considered not passed.
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &TelepadPartOne {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            // This code uses the get_orientation function to figure out which
            // way the rover is facing. You DON'T need to change this part.
            move_forward(3);
            say("I am facing " + get_orientation());
            
            // If the rover is facing up, turn to the right and then move
            // forward. You DON'T need to change this part.
            if get_orientation() == "up" {
                turn_right();
                move_forward(3);
            }
            
            // Add more if statements to handle the other possible orientations.
            // ADD YOUR CODE BELOW
            if get_orientation() == "down" {
            turn_left();
                move_forward(3);
            }
            if get_orientation() == "left" {
                turn_right();
                turn_right();
                move_forward(3);
            }
            if get_orientation() == "right" {
                move_forward(3);
            }
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &TelepadPartOne {};

        // This code beats the objective but should not pass the challenge.
        let script = r#"
            // This code uses the get_orientation function to figure out which
            // way the rover is facing. You DON'T need to change this part.
            move_forward(3);
            
            // If the rover is facing up, turn to the right and then move
            // forward. You DON'T need to change this part.
            if get_orientation() == "up" {
                turn_right();
                move_forward(3);
            }
            
            // Add more if statements to handle the other possible orientations.
            // ADD YOUR CODE BELOW
            if get_orientation() == "down" {
                turn_left();
                move_forward(3);
            }
            if get_orientation() == "left" {
                turn_right();
                turn_right();
                move_forward(3);
            }
            if get_orientation() == "right" {
                move_forward(3);
            }
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code meets the code length requirement but should not pass
        // the challenge because it defines a new function.
        let script = r#"
            fn f() {
                move_forward(3);
            }
            fn r() {
                turn_right();
            }
            f();
            let x = get_orientation();
            if x == "up" {
                r();
                f();
            }
            if x == "down" {
                r();
                r();
                r();
                f();
            }
            if x == "left" {
                r();
                r();
                f();
            }
            f();
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code should pass the challenge.
        let script = r#"
            move_forward(3);
            let facing = get_orientation();
            if facing == "up" {
                turn_right();
            }
            if facing == "down" {
                turn_left();
            }
            if facing == "left" {
                turn_left();
                turn_left();
            }
            move_forward(3);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
