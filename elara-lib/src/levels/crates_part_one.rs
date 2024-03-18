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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &CratesPartOne {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_forward(1);
            pick_up();
            move_forward(3);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // This should work too.
        let script = r#"
            move_forward(1);
            pick_up();
            turn_right();
            drop();
            turn_left();
            move_forward(3);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
