use super::{std_check_win, Level, Outcome};
use crate::{
    script_runner::ScriptStats,
    simulation::{Actor, EnergyCell, Goal, Obstacle, Orientation, Player, Pos, State},
};

#[derive(Copy, Clone)]
pub struct EnergyPartOne {}

impl Level for EnergyPartOne {
    fn name(&self) -> &'static str {
        "Energized"
    }
    fn short_name(&self) -> &'static str {
        "energy_part_one"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Try collecting an energy cell before moving to the goal.

// CHANGE THE CODE BELOW
move_forward(4);
turn_left();
move_forward(4);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 0, 5, Orientation::Down);
        state.energy_cells = vec![EnergyCell {
            pos: Pos { x: 0, y: 5 },
            collected: false,
        }];
        state.goals = vec![Goal::new(4, 4)];
        state.obstacles = vec![
            // Obstacles enclose the player, goal, and energy cells with a few different
            // branching paths.
            Obstacle::new(1, 1),
            Obstacle::new(1, 2),
            Obstacle::new(1, 3),
            Obstacle::new(2, 1),
            Obstacle::new(2, 2),
            Obstacle::new(2, 3),
            Obstacle::new(3, 1),
            Obstacle::new(3, 2),
            Obstacle::new(3, 3),
            Obstacle::new(5, 0),
            Obstacle::new(5, 1),
            Obstacle::new(5, 2),
            Obstacle::new(5, 3),
            Obstacle::new(5, 4),
            Obstacle::new(5, 5),
            Obstacle::new(4, 5),
            Obstacle::new(3, 5),
            Obstacle::new(2, 5),
            Obstacle::new(1, 5),
            Obstacle::new(1, 6),
            Obstacle::new(1, 7),
        ];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Complete the objective in 11 or fewer steps.")
    }
    fn check_challenge(&self, _states: &[State], _script: &str, stats: &ScriptStats) -> bool {
        stats.time_taken <= 11
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::{Outcome, ERR_OUT_OF_ENERGY};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &EnergyPartOne {};

        // Running the initial code should result in Outcome::Failure due to
        // running out of energy.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_ENERGY))
        );

        // Running this code should result in Outcome::Success.
        let script = r"
            move_forward(5);
            turn_left();
            turn_left();
            move_forward(1);
            turn_right();
            move_forward(4);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Player should not be able to move past the obstacles for this level.
        let script = r"
            move_forward(5);
            turn_left();
            move_forward(4);
            turn_left();
            move_forward(1);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &EnergyPartOne {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r"
            move_forward(5);
            turn_left();
            turn_left();
            move_forward(1);
            turn_right();
            move_forward(4);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r"
            move_forward(5);
            move_backward(1);
            turn_left();
            move_forward(4);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
