use rhai::Engine;

use super::{std_check_win, Level, Outcome};
use crate::{
    actors::{Bounds, EvilRoverActor},
    constants::{HEIGHT, WIDTH},
    script_runner::ScriptStats,
    simulation::{Actor, Enemy, EnergyCell, Goal, Obstacle, Orientation, Player, Pos, State},
};

#[derive(Copy, Clone)]
pub struct LoopsPartTwo {}

impl Level for LoopsPartTwo {
    fn name(&self) -> &'static str {
        "All By Yourself"
    }
    fn short_name(&self) -> &'static str {
        "loops_part_two"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Try writing a loop on your own this time.
// Don't forget to use the loop keyword.
//
// ADD YOUR CODE BELOW
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 0, 10, Orientation::Right);
        state.energy_cells = vec![EnergyCell::new(7, 3)];
        state.goals = vec![Goal {
            pos: Pos { x: 10, y: 5 },
        }];
        state.obstacles = vec![
            Obstacle::new(0, 1),
            Obstacle::new(1, 1),
            Obstacle::new(1, 2),
            Obstacle::new(2, 2),
            Obstacle::new(3, 2),
            Obstacle::new(3, 3),
            Obstacle::new(4, 3),
            Obstacle::new(5, 3),
            Obstacle::new(5, 4),
            Obstacle::new(6, 4),
            Obstacle::new(7, 4),
            Obstacle::new(7, 5),
            Obstacle::new(8, 5),
            Obstacle::new(9, 5),
            Obstacle::new(9, 6),
            Obstacle::new(10, 6),
            Obstacle::new(11, 6),
            Obstacle::new(3, 0),
            Obstacle::new(4, 0),
            Obstacle::new(5, 0),
            Obstacle::new(5, 1),
            Obstacle::new(6, 1),
            Obstacle::new(7, 1),
            Obstacle::new(7, 2),
            Obstacle::new(8, 2),
            Obstacle::new(9, 2),
            Obstacle::new(9, 3),
            Obstacle::new(10, 3),
            Obstacle::new(11, 3),
            Obstacle::new(11, 4),
            Obstacle::new(11, 5),
        ];
        state.enemies = vec![Enemy::new(12, 2, Orientation::Left)];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(EvilRoverActor::new(
            0,
            Bounds {
                min_x: 0,
                max_x: (WIDTH - 1) as i32,
                min_y: 0,
                max_y: (HEIGHT - 1) as i32,
            },
        ))]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Have a code length of 84 characters or less and don't use a loop.")
    }
    fn check_challenge(&self, _states: &[State], script: &str, stats: &ScriptStats) -> bool {
        if stats.code_len > 84 {
            return false;
        }
        // Script cannot contain the key words "loop", "for", "while", or "do".
        // Strip the comments first, then use a regex to check for keywords.
        if let Ok(script) = Engine::new().compact_script(script) {
            let loop_regex = regex::Regex::new(r"\b(loop|for|while|do)\b").unwrap();
            return !loop_regex.is_match(script.as_str());
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
        const LEVEL: &'static dyn Level = &LoopsPartTwo {};

        // Running the initial code should result in Outcome::Continue because
        // the rover does not move at all.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r"
            loop {
                move_forward(2);
                turn_right();
                move_forward(1);
                turn_left();
            }";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &LoopsPartTwo {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r"
            loop {
                move_forward(2);
                turn_right();
                move_forward(1);
                turn_left();
            }";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r#"
            fn main() {
                move_forward(2);
                turn_right();
                move_forward(1);
                turn_left();
                main();
            }

            main();"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);

        // This code also satisfies the challenge conditions. It's fine if
        // comments contain the "loop", "for", "while", or "do" keywords.
        let script = r#"
            // loop
            // for
            // while
            // do
            fn main() {
                move_forward(2);
                turn_right();
                move_forward(1);
                turn_left();
                main();
            }

            main();"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);

        // Here is an alternative solution that passes the challenge.
        let script = r#"
            [0,1,2,3,4].map(|| {
                move_forward(2);
                turn_right();
                move_forward(1);
                turn_left();
            });"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
