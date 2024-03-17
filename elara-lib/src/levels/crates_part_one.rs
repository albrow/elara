use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, Crate, CrateColor, Goal, Obstacle, Orientation, Player, State};

#[derive(Copy, Clone)]
pub struct CratesPartOne {}

impl Level for CratesPartOne {
    fn name(&self) -> &'static str {
        "Blocking the Way"
    }
    fn short_name(&self) -> &'static str {
        "crates_part_one"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Looks like there's a crate blocking the way. Use the pick_up
// and drop functions to move it.

"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(8, 4, 10, Orientation::Left);
        state.goals = vec![Goal::new(4, 4)];
        state.obstacles = vec![
            Obstacle::new(3, 3),
            Obstacle::new(3, 4),
            Obstacle::new(3, 5),
            Obstacle::new(4, 3),
            Obstacle::new(4, 5),
            Obstacle::new(5, 3),
            Obstacle::new(5, 5),
            Obstacle::new(6, 3),
            Obstacle::new(6, 5),
        ];
        state.crates = vec![Crate::new(6, 4, CrateColor::Blue)];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use crate::constants::ERR_OUT_OF_ENERGY;
//     use crate::levels::Outcome;

//     #[test]
//     fn level() {
//         let mut game = crate::Game::new();
//         const LEVEL: &'static dyn Level = &CratesPartOne {};

//         // Running the initial code should result in Outcome::Continue.
//         let script = LEVEL.initial_code();
//         let result = game
//             .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Continue);

//         // Running this code should result in Outcome::Success.
//         let script = r#"move_forward(2); say("lovelace"); move_forward(5);"#;
//         let result = game
//             .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Success);

//         // Attempting to reach the goal without saying the password should
//         // result in running out of energy.
//         let script = "loop { move_forward(1); }";
//         let result = game
//             .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
//             .unwrap();
//         assert_eq!(
//             result.outcome,
//             Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
//         );

//         // Saying the wrong password should not open the gate.
//         let script = r#"move_forward(2); say("wrong password"); move_forward(5);"#;
//         let result = game
//             .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Continue);

//         // Saying the password when not next to the gate should not
//         // open it.
//         let script = r#"say("lovelace"); move_forward(2); move_forward(5);"#;
//         let result = game
//             .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Continue);

//         // Saying the password again, should close the gate, meaning we
//         // can't reach the goal.
//         let script = r#"move_forward(2); say("lovelace"); say("lovelace"); move_forward(5);"#;
//         let result = game
//             .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Continue);

//         // Saying the password 3x, should result in the gate being open again.
//         let script = r#"move_forward(2); say("lovelace"); say("lovelace"); say("lovelace"); move_forward(5);"#;
//         let result = game
//             .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Success);
//     }

//     #[test]
//     fn challenge() {
//         let mut game = crate::Game::new();
//         const LEVEL: &'static dyn Level = &CratesPartOne {};

//         // This code beats the level, but doesn't satisfy the challenge conditions.
//         let script = r#"
//             move_forward(2);
//             say("lovelace");
//             move_forward(5);"#;
//         let result = game
//             .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Success);
//         assert!(!result.passes_challenge);

//         // This code satisfies the challenge conditions.
//         let script = r#"
//             loop {
//                 move_forward(2);
//                 say("lovelace");
//             }"#;
//         let result = game
//             .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Success);
//         assert!(result.passes_challenge);
//     }
// }
