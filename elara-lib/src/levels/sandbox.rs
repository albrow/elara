use super::{no_objective_check_win, Level, Outcome};
use crate::{
    constants::MAX_ENERGY,
    simulation::{Actor, State},
};

#[derive(Copy, Clone)]
/// Sandbox is a special level which does not have an explicit objective. It can
/// be used in runnable examples or for players to explore and experiment on
/// their own.
pub struct Sandbox {}

impl Level for Sandbox {
    fn name(&self) -> &'static str {
        "Sandbox"
    }
    fn short_name(&self) -> &'static str {
        "sandbox"
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
        vec![State::new()]
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
    use crate::{constants::ERR_OUT_OF_ENERGY, levels::Outcome};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &Sandbox {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }

    #[test]
    fn increased_bounds() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &Sandbox {};

        // Sandbox level has greatly increased bounds, even allowing player position
        // to be negative.
        let script = "turn_left(); move_forward(50);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        );
        assert_eq!(result.states.last().unwrap().player.pos.y, -50);

        let script = "turn_right(); move_forward(50);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        );
        assert_eq!(result.states.last().unwrap().player.pos.y, 50);

        let script = "turn_left(); turn_left(); move_forward(50);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        );
        assert_eq!(result.states.last().unwrap().player.pos.x, -50);

        let script = "move_forward(50);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        );
        assert_eq!(result.states.last().unwrap().player.pos.x, 50);
    }
}
