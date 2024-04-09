use super::{std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, Crate, CrateColor, EnergyCell, Goal, Obstacle, Orientation, Player, State,
};

#[derive(Copy, Clone)]
pub struct CratesPartThree {}

impl Level for CratesPartThree {
    fn name(&self) -> &'static str {
        "Name TBD"
    }
    fn short_name(&self) -> &'static str {
        "crates_part_three"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// This time there is more than one crate in the way. The code
// below moves the first crate out of the way, but there are still
// two more to go!
move_forward(3);
turn_left();
pick_up();
turn_left();
move_forward(2);
drop();
// ADD YOUR CODE BELOW:
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(7, 1, 20, Orientation::Left);
        state.goals = vec![Goal::new(7, 5)];
        state.obstacles = vec![
            Obstacle::new(3, 0),
            Obstacle::new(3, 1),
            Obstacle::new(3, 2),
            Obstacle::new(3, 3),
            Obstacle::new(3, 4),
            Obstacle::new(3, 5),
            Obstacle::new(3, 6),
            Obstacle::new(4, 6),
            Obstacle::new(5, 0),
            Obstacle::new(5, 2),
            Obstacle::new(5, 3),
            Obstacle::new(5, 4),
            Obstacle::new(5, 6),
            Obstacle::new(6, 0),
            Obstacle::new(6, 2),
            Obstacle::new(6, 4),
            Obstacle::new(6, 6),
            Obstacle::new(7, 0),
            Obstacle::new(7, 2),
            Obstacle::new(7, 4),
            Obstacle::new(7, 6),
            Obstacle::new(8, 0),
            Obstacle::new(8, 1),
            Obstacle::new(8, 2),
            Obstacle::new(8, 4),
            Obstacle::new(8, 5),
            Obstacle::new(8, 6),
        ];
        state.crates = vec![
            Crate::new(4, 2, CrateColor::Blue),
            Crate::new(4, 3, CrateColor::Red),
            Crate::new(4, 4, CrateColor::Green),
        ];
        state.energy_cells = vec![EnergyCell::new(4, 1)];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Use 12 energy or less _and_ have a code length of 190 chars or less.")
    }
    fn check_challenge(
        &self,
        _states: &[State],
        _script: &str,
        stats: &crate::script_runner::ScriptStats,
    ) -> bool {
        stats.code_len <= 190 && stats.energy_used <= 12
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &CratesPartThree {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        // (This is the longest way to do it).
        let script = r#"
            move_forward(3);
            turn_left();
            pick_up();
            turn_left();
            move_forward(2);
            drop();
            turn_right();
            turn_right();
            move_forward(2);
            turn_left();
            move_forward(1);
            pick_up();
            turn_left();
            turn_left();
            move_forward(1);
            turn_right();
            move_forward(1);
            drop();
            turn_right();
            turn_right();
            move_forward(1);
            turn_left();
            move_forward(2);
            pick_up();
            turn_left();
            turn_left();
            move_forward(2);
            turn_right();
            drop();
            turn_right();
            move_forward(4);
            turn_left();
            move_forward(3);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &CratesPartThree {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r#"
        move_forward(3);
        turn_left();
        pick_up();
        turn_left();
        drop();
        turn_right();
        move_forward(1);
        pick_up();
        move_backward(1);
        turn_left();
        turn_left();
        drop();
        turn_left();
        turn_left();
        move_forward(2);
        pick_up();
        move_forward(2);
        turn_left();
        move_forward(3);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r#"
            move_forward(3);
            turn_left();
            
            let x = 0;
            while x < 2 {
                pick_up();
                turn_left();
                turn_left();
                drop();
                turn_left();
                turn_left();
                x += 1;
                move_forward(x);
            }
            pick_up();
            move_forward(2);
            turn_left();
            move_forward(3);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
