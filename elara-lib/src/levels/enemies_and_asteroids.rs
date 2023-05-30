use super::{std_check_win, Level, Outcome, AVAIL_FUNCS_WITH_READ};
use crate::actors::{Bounds, EvilRoverActor};
use crate::simulation::{Actor, DataTerminal, Enemy, FuelSpot, Orientation};
use crate::simulation::{Goal, Obstacle, Player, State};
use crate::state_maker::StateMaker;

#[derive(Copy, Clone)]
pub struct EnemiesAndAsteroids {}

impl EnemiesAndAsteroids {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        return vec![
            Obstacle::new(0, 7),
            Obstacle::new(1, 1),
            Obstacle::new(1, 3),
            Obstacle::new(1, 4),
            Obstacle::new(1, 5),
            Obstacle::new(1, 7),
            Obstacle::new(2, 1),
            Obstacle::new(2, 5),
            Obstacle::new(2, 7),
            Obstacle::new(3, 1),
            Obstacle::new(3, 3),
            Obstacle::new(3, 7),
            Obstacle::new(4, 1),
            Obstacle::new(4, 3),
            Obstacle::new(4, 5),
            Obstacle::new(4, 6),
            Obstacle::new(4, 7),
            Obstacle::new(5, 7),
            Obstacle::new(6, 1),
            Obstacle::new(6, 3),
            Obstacle::new(6, 5),
            Obstacle::new(6, 6),
            Obstacle::new(6, 7),
            Obstacle::new(7, 1),
            Obstacle::new(7, 7),
            Obstacle::new(8, 1),
            Obstacle::new(8, 3),
            Obstacle::new(8, 4),
            Obstacle::new(8, 5),
            Obstacle::new(8, 7),
            Obstacle::new(9, 1),
            Obstacle::new(9, 7),
            Obstacle::new(10, 1),
            Obstacle::new(10, 3),
            Obstacle::new(10, 4),
            Obstacle::new(10, 5),
            Obstacle::new(10, 7),
            Obstacle::new(11, 7),
        ];
    }
}

impl Level for EnemiesAndAsteroids {
    fn name(&self) -> &'static str {
        "Into Danger"
    }
    fn short_name(&self) -> &'static str {
        "enemies_and_asteroids"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to one of the goals ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAIL_FUNCS_WITH_READ
    }
    fn initial_code(&self) -> &'static str {
        r#"// Add your code below:
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state_maker = StateMaker::new();
        let base_state = state_maker
            .with_player(Player::new(5, 6, 16, Orientation::Up))
            .with_fuel_spots(vec![FuelSpot::new(2, 0), FuelSpot::new(9, 0)])
            .with_goals(vec![Goal::new(7, 6), Goal::new(3, 6)])
            .with_enemies(vec![
                Enemy::new(2, 2, Orientation::Down),
                Enemy::new(9, 2, Orientation::Left),
            ]);
        vec![
            base_state
                .clone()
                .with_obstacles(
                    [
                        self.obstacles().clone(),
                        vec![Obstacle::new(4, 0), Obstacle::new(4, 4)],
                    ]
                    .concat(),
                )
                .with_data_terminal(vec![DataTerminal::new(5, 7, "right".into())])
                .build(),
            base_state
                .clone()
                .with_obstacles(
                    [
                        self.obstacles().clone(),
                        vec![Obstacle::new(6, 0), Obstacle::new(6, 4)],
                    ]
                    .concat(),
                )
                .with_data_terminal(vec![DataTerminal::new(5, 7, "left".into())])
                .build(),
        ]
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
        Some("Complete the objective in 22 or fewer steps.")
    }
    fn check_challenge(
        &self,
        _states: &Vec<State>,
        _script: &str,
        stats: &crate::script_runner::ScriptStats,
    ) -> bool {
        stats.time_taken <= 22
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{constants::ERR_DESTROYED_BY_ENEMY, levels::Outcome};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &EnemiesAndAsteroids {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // This is the "long way" around and the most straightforward
        // path. Running this code should result in Outcome::Success.
        let script = r#"
            let safe_direction = read_data();

            if safe_direction == "right" { 
                move_forward(6);
                turn_right();
                move_forward(6);
                turn_right();
                move_forward(6);
                turn_right();
                move_forward(4);
            }
            if safe_direction == "left" {
                move_forward(6);
                turn_left();
                move_forward(5);
                turn_left();
                move_forward(6);
                turn_left();
                move_forward(3);
            }
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // This is the "short way". Trying to take the shortest
        // path should result in failure.
        let script = r#"
            let safe_direction = read_data();

            if safe_direction == "right" { 
                move_forward(2);
                turn_right();
                move_forward(2);
                turn_left();
                move_forward(2);
                turn_right();
            }
            if safe_direction == "left" {
                move_forward(2);
                turn_left();
                move_forward(2);
                turn_left();
                move_forward(2);
            }
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_DESTROYED_BY_ENEMY.into())
        );

        // This is the "wrong way". Trying to go in the opposite of
        // the safe direction without waiting first should result in failure.
        let script = r#"
            let safe_direction = read_data();

            if safe_direction == "right" { 
                move_forward(4);
                turn_left();
                move_forward(5);
                turn_left();
                move_forward(4);
                turn_left();
                move_forward(3);
            }
            if safe_direction == "left" {
                move_forward(4);
                turn_right();
                move_forward(2);
                turn_right();
                move_forward(4);
                turn_right();
                move_forward(2);
            }
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(ERR_DESTROYED_BY_ENEMY.into())
        );
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &EnemiesAndAsteroids {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r#"
            let safe_direction = read_data();

            if safe_direction == "right" { 
                move_forward(6);
                turn_right();
                move_forward(6);
                turn_right();
                move_forward(6);
                turn_right();
                move_forward(4);
            }
            if safe_direction == "left" {
                move_forward(6);
                turn_left();
                move_forward(5);
                turn_left();
                move_forward(6);
                turn_left();
                move_forward(3);
            }
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, false);

        // Here is the "clever way" which involves using the say function to
        // wait for one or two steps then moving in the "unsafe" direction with
        // a specific path to narrowly avoid the enemies.
        //
        // This code should beat the level and pass the challenge.
        let script = r#"
            let safe_direction = read_data();

            if safe_direction == "right" {
                say("waiting");
                move_forward(4);
                turn_left();
                move_forward(5);
                turn_left();
                move_forward(4);
                turn_left();
                move_forward(3);
            }
            if safe_direction == "left" {
                say("waiting");
                say("waiting");
                move_forward(4);
                turn_right();
                move_forward(2);
                turn_right();
                move_forward(4);
                turn_right();
                move_forward(2);
            }
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, true);
    }
}
