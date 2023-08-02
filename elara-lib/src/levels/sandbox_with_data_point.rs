use super::{no_objective_check_win, Level, Outcome};
use crate::{
    constants::MAX_ENERGY,
    simulation::{Actor, DataPoint, Orientation, Player, State},
};

#[derive(Copy, Clone)]
/// Sandbox is a special level which does not have an explicit objective. It can
/// be used in runnable examples or for players to explore and experiment on
/// their own.
pub struct SandboxWithDataPoint {}

impl Level for SandboxWithDataPoint {
    fn name(&self) -> &'static str {
        "Sandbox"
    }
    fn short_name(&self) -> &'static str {
        "sandbox_with_data_point"
    }
    fn objective(&self) -> &'static str {
        "Write whatever code you want :)"
    }
    fn initial_code(&self) -> &'static str {
        // Note(albrow): Typically the initial code would be provided in the UI.
        // E.g. for a runnable example, we would start with the corresponding example
        // code.
        ""
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 0, 50, Orientation::Right);
        state.data_points = vec![DataPoint::new(1, 0, "bananas".into())];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        no_objective_check_win(state)
    }
    fn bounds(&self) -> crate::actors::Bounds {
        // For the sandbox level, we allow the player to move in any direction
        // until they run out of energy.
        crate::actors::Bounds {
            min_x: -(MAX_ENERGY as i32),
            max_x: MAX_ENERGY as i32,
            min_y: -(MAX_ENERGY as i32),
            max_y: MAX_ENERGY as i32,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &SandboxWithDataPoint {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // We should be able to read from the data point.
        let script = "say(read_data());";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::NoObjective);
        assert_eq!(result.states.last().unwrap().player.message, "bananas");
    }
}
