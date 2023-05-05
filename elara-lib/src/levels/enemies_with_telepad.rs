use super::{make_all_initial_states_for_telepads, std_check_win, Level, Outcome};
use crate::actors::{Bounds, EvilRoverActor};
use crate::constants::{HEIGHT, WIDTH};
use crate::simulation::{Actor, Enemy, Goal, Obstacle, Orientation, Player, Pos, State, Telepad};
use crate::state_maker::StateMaker;

// TODO(albrow): Flesh this out into an actual level.

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
        "Testing Enemies With Telepad"
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
        r"
"
    }
    fn initial_states(&self) -> Vec<State> {
        let base_state = StateMaker::new()
            .with_player(Player::new(0, 0, 50, Orientation::Down))
            .with_goal(Some(Goal {
                pos: Pos { x: 1, y: 5 },
            }))
            .with_enemies(vec![Enemy::new(0, 5, Orientation::Up)])
            .with_obstacles(vec![])
            .with_telepads(vec![Telepad::new((0, 3), (11, 0), Orientation::Up)])
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
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use crate::constants::ERR_DESTROYED_BY_ENEMY;
//     use crate::levels::Outcome;

//     #[test]
//     fn level() {
//         let mut game = crate::Game::new();
//         const LEVEL: &'static dyn Level = &EnemiesWithTelepad {};

//         // Running the initial code should result in Outcome::Failure due to
//         // being destroyed by the malfunctioning rover.
//         let script = LEVEL.initial_code();
//         let result = game
//             .run_player_script_internal(script.to_string(), LEVEL)
//             .unwrap();
//         assert_eq!(
//             result.outcome,
//             Outcome::Failure(String::from(ERR_DESTROYED_BY_ENEMY))
//         );

//         // Running this code should result in Outcome::Success.
//         let script = r"
//             turn_right();
//             move_forward(6);
//             turn_left();
//             move_forward(3);
//             turn_left();
//             move_forward(6);
//         ";
//         let result = game
//             .run_player_script_internal(script.to_string(), LEVEL)
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Success);
//     }
// }
