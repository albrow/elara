use super::{std_check_win, Level, Outcome};
use crate::actors::{Bounds, EvilRoverActor};
use crate::simulation::{Actor, Enemy, EnergyCell, Goal, Obstacle, Orientation, Player, State};

#[derive(Copy, Clone)]
pub struct EnemiesPartTwo {}

impl Level for EnemiesPartTwo {
    fn name(&self) -> &'static str {
        "Double Trouble"
    }
    fn short_name(&self) -> &'static str {
        "enemies_part_two"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r"// Try to reach the goal while avoiding the malfunctioning rovers.
"
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(2, 3, 10, Orientation::Right);
        state.energy_cells = vec![EnergyCell::new(6, 5)];
        state.goals = vec![Goal::new(8, 2)];
        state.enemies = vec![
            Enemy::new(0, 7, Orientation::Up),
            Enemy::new(6, 0, Orientation::Left),
        ];
        state.obstacles = vec![
            Obstacle::new(0, 4),
            Obstacle::new(1, 2),
            Obstacle::new(1, 3),
            Obstacle::new(1, 4),
            Obstacle::new(1, 5),
            Obstacle::new(2, 2),
            Obstacle::new(3, 0),
            Obstacle::new(3, 1),
            Obstacle::new(3, 2),
            Obstacle::new(3, 4),
            Obstacle::new(3, 5),
            Obstacle::new(3, 7),
            Obstacle::new(4, 2),
            Obstacle::new(4, 7),
            Obstacle::new(5, 1),
            Obstacle::new(5, 2),
            Obstacle::new(5, 4),
            Obstacle::new(5, 6),
            Obstacle::new(5, 7),
            Obstacle::new(6, 4),
            Obstacle::new(7, 0),
            Obstacle::new(7, 1),
            Obstacle::new(7, 3),
            Obstacle::new(7, 4),
            Obstacle::new(7, 5),
            Obstacle::new(7, 6),
            Obstacle::new(8, 0),
            Obstacle::new(8, 1),
            Obstacle::new(9, 0),
            Obstacle::new(9, 1),
            Obstacle::new(9, 2),
            Obstacle::new(9, 3),
            Obstacle::new(9, 4),
            Obstacle::new(9, 5),
            Obstacle::new(9, 6),
            Obstacle::new(9, 7),
        ];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![
            Box::new(EvilRoverActor::new(0, Bounds::default())),
            Box::new(EvilRoverActor::new(1, Bounds::default())),
        ]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Reach the goal using 7 energy or less.")
    }
    fn check_challenge(
        &self,
        _states: &[State],
        _script: &str,
        stats: &crate::script_runner::ScriptStats,
    ) -> bool {
        stats.energy_used <= 7
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::ERR_DESTROYED_BY_ENEMY;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &EnemiesPartTwo {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Trying to go straight for the goal should result in being destroyed
        // by a malfunctioning rover.
        let script = r"
            move_forward(4);
            turn_left();
            move_forward(1);
            turn_right();
            move_forward(2);
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_DESTROYED_BY_ENEMY.into())
        );

        // Running this code should result in Outcome::Success.
        let script = r"
            move_forward(2);
            turn_right();
            move_forward(2);
            turn_left();
            move_forward(2);
            turn_right();
            move_forward(2);
            turn_left();
            move_forward(2);
            turn_left();
            move_forward(5);
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &EnemiesPartTwo {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r"
            move_forward(2);
            turn_right();
            move_forward(2);
            turn_left();
            move_forward(2);
            turn_right();
            move_forward(2);
            turn_left();
            move_forward(2);
            turn_left();
            move_forward(5);
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r#"
            say("waiting");
            move_forward(4);
            turn_left();
            move_forward(1);
            turn_right();
            move_forward(2);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
