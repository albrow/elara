use super::{std_check_win, Level, Outcome};
use crate::{
    script_runner::ScriptStats,
    simulation::{Actor, Goal, Obstacle, Orientation, PasswordGate, Player, State},
};

#[derive(Copy, Clone)]
pub struct ButtonsPartOne {}

impl Level for ButtonsPartOne {
    fn name(&self) -> &'static str {
        "Pressing Buttons"
    }
    fn short_name(&self) -> &'static str {
        "buttons_part_one"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 3, 10, Orientation::Right);
        state.goals = vec![Goal::new(7, 3)];
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
        // let mut game = crate::Game::new();
        // const LEVEL: &'static dyn Level = &Gates {};

        // // Running the initial code should result in Outcome::Continue.
        // let script = LEVEL.initial_code();
        // let result = game
        //     .run_player_script_internal(script.to_string(), LEVEL)
        //     .unwrap();
        // assert_eq!(result.outcome, Outcome::Continue);

        // // Running this code should result in Outcome::Success.
        // let script = r#"move_forward(2); say("lovelace"); move_forward(5);"#;
        // let result = game
        //     .run_player_script_internal(script.to_string(), LEVEL)
        //     .unwrap();
        // assert_eq!(result.outcome, Outcome::Success);
    }
}
