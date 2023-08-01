use super::{std_check_win, Level, Outcome};
use crate::actors::{Bounds, EvilRoverActor};
use crate::simulation::{Actor, Enemy, Goal, Obstacle, Orientation, Player, State};

#[derive(Copy, Clone)]
pub struct EnemiesPartOne {}

impl Level for EnemiesPartOne {
    fn name(&self) -> &'static str {
        "Malfunction Detected"
    }
    fn short_name(&self) -> &'static str {
        "enemies_part_one"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r"// If you try going straight for the goal, you might run
// into trouble. Can you find a different path?

// CHANGE THE CODE BELOW
move_forward(3);
"
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(8, 2, 20, Orientation::Down);
        state.energy_cells = vec![];
        state.goals = vec![Goal::new(8, 5)];
        state.enemies = vec![Enemy::new(8, 6, Orientation::Up)];
        state.obstacles = vec![
            Obstacle::new(3, 3),
            Obstacle::new(3, 4),
            Obstacle::new(4, 3),
            Obstacle::new(4, 4),
            Obstacle::new(5, 3),
            Obstacle::new(5, 4),
            Obstacle::new(6, 3),
            Obstacle::new(6, 4),
            Obstacle::new(7, 3),
            Obstacle::new(7, 4),
        ];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(EvilRoverActor::new(0, Bounds::default()))]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
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
        const LEVEL: &'static dyn Level = &EnemiesPartOne {};

        // Running the initial code should result in Outcome::Failure due to
        // being destroyed by the malfunctioning rover.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_DESTROYED_BY_ENEMY))
        );

        // Running this code should result in Outcome::Success.
        let script = r"
            turn_right();
            move_forward(6);
            turn_left();
            move_forward(3);
            turn_left();
            move_forward(6);
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
