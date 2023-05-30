use super::{make_all_initial_states_for_telepads, std_check_win, Level, Outcome};
use crate::actors::{Bounds, EvilRoverActor};
use crate::constants::{HEIGHT, WIDTH};
use crate::simulation::{
    Actor, Enemy, FuelSpot, Goal, Obstacle, Orientation, Player, State, Telepad,
};
use crate::state_maker::StateMaker;

lazy_static! {
    static ref TELEPAD_FUNCS: Vec<&'static str> = vec![
        "move_forward",
        "move_backward",
        "turn_left",
        "turn_right",
        "say",
        "read_data",
        "get_orientation"
    ];
}

#[derive(Copy, Clone)]
pub struct EnemiesWithTelepad {}

impl Level for EnemiesWithTelepad {
    fn name(&self) -> &'static str {
        "Outmaneuvered"
    }
    fn short_name(&self) -> &'static str {
        "enemies_with_telepad"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &TELEPAD_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        r"// Try using the telepad to get around the malfunctioning rover.
"
    }
    fn initial_states(&self) -> Vec<State> {
        let base_state = StateMaker::new()
            .with_player(Player::new(11, 7, 10, Orientation::Left))
            .with_goals(vec![Goal::new(7, 7)])
            .with_obstacles(vec![
                Obstacle::new(0, 3),
                Obstacle::new(1, 3),
                Obstacle::new(2, 3),
                Obstacle::new(3, 3),
                Obstacle::new(4, 3),
                Obstacle::new(5, 3),
                Obstacle::new(6, 3),
                Obstacle::new(7, 3),
                Obstacle::new(8, 3),
                Obstacle::new(9, 3),
                Obstacle::new(1, 5),
                Obstacle::new(1, 6),
                Obstacle::new(2, 5),
                Obstacle::new(2, 6),
                Obstacle::new(3, 5),
                Obstacle::new(3, 6),
                Obstacle::new(4, 5),
                Obstacle::new(5, 5),
                Obstacle::new(5, 6),
                Obstacle::new(6, 5),
                Obstacle::new(6, 6),
                Obstacle::new(8, 6),
                Obstacle::new(8, 5),
                Obstacle::new(9, 5),
                Obstacle::new(10, 2),
                Obstacle::new(10, 3),
                Obstacle::new(10, 4),
                Obstacle::new(10, 5),
                Obstacle::new(10, 6),
                Obstacle::new(11, 2),
            ])
            .with_fuel_spots(vec![FuelSpot::new(3, 4)])
            .with_enemies(vec![Enemy::new(5, 7, Orientation::Right)])
            .with_telepads(vec![Telepad::new((9, 6), (0, 7), Orientation::Up)])
            .build();
        make_all_initial_states_for_telepads(vec![base_state])
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(EvilRoverActor::new(
            0,
            Bounds {
                min_x: 0,
                max_x: (WIDTH - 1) as i32,
                min_y: 0,
                max_y: (HEIGHT - 1) as i32,
            },
        ))]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Reach the goal without picking up any additional fuel.")
    }
    fn check_challenge(
        &self,
        states: &Vec<State>,
        _script: &str,
        _stats: &crate::script_runner::ScriptStats,
    ) -> bool {
        if states.len() == 0 {
            return false;
        }
        states.last().unwrap().fuel_spots[0].collected == false
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
        const LEVEL: &'static dyn Level = &EnemiesWithTelepad {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_forward(2);
            turn_right();
            move_forward(1);
            if get_orientation() == "left" {
                turn_right();
            }
            if get_orientation() == "right" {
                turn_left();
            }
            if get_orientation() == "down" {
                turn_left();
                turn_left();
            }
            move_forward(3);
            turn_right();
            move_forward(7);
            turn_right();
            move_forward(3);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Trying to go straight for the goal should result in the rover
        // being destroyed.
        let script = r"
            move_forward(4);
        ";
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
        const LEVEL: &'static dyn Level = &EnemiesWithTelepad {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r#"
            move_forward(2);
            turn_right();
            move_forward(1);
            if get_orientation() == "left" {
                turn_right();
            }
            if get_orientation() == "right" {
                turn_left();
            }
            if get_orientation() == "down" {
                turn_left();
                turn_left();
            }
            move_forward(3);
            turn_right();
            move_forward(7);
            turn_right();
            move_forward(3);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, false);

        // This code satisfies the challenge conditions.
        let script = r#"
            turn_right();
            move_forward(3);
            say("waiting");
            move_backward(3);
            turn_left();
            move_forward(4);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, true);
    }
}
