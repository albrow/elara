use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, Goal, Obstacle, Orientation, Player, Pos, State, Telepad};

#[derive(Copy, Clone)]
pub struct TelepadPartOne {}

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

impl TelepadPartOne {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        return vec![
            Obstacle::new(0, 3),
            Obstacle::new(0, 5),
            Obstacle::new(1, 3),
            Obstacle::new(1, 5),
            Obstacle::new(2, 3),
            Obstacle::new(2, 5),
            Obstacle::new(3, 3),
            Obstacle::new(3, 5),
            Obstacle::new(4, 3),
            Obstacle::new(4, 4),
            Obstacle::new(4, 5),
        ];
    }
}

impl Level for TelepadPartOne {
    fn name(&self) -> &'static str {
        // TODO(albrow): Change this name.
        "Telepad Part One"
    }
    fn short_name(&self) -> &'static str {
        "telepad_part_one"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &TELEPAD_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        // TODO(albrow): Add initial code.
        r#"
"#
    }

    fn initial_states(&self) -> Vec<State> {
        vec![
            State {
                player: Player::new(0, 4, 10, Orientation::Right),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 11, y: 4 },
                }),
                enemies: vec![],
                obstacles: self.obstacles().clone(),
                password_gates: vec![],
                data_terminals: vec![],
                telepads: vec![Telepad::new((3, 4), (8, 4), Orientation::Up)],
            },
            State {
                player: Player::new(0, 4, 10, Orientation::Right),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 11, y: 4 },
                }),
                enemies: vec![],
                obstacles: self.obstacles().clone(),
                password_gates: vec![],
                data_terminals: vec![],
                telepads: vec![Telepad::new((3, 4), (8, 4), Orientation::Down)],
            },
            State {
                player: Player::new(0, 4, 10, Orientation::Right),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 11, y: 4 },
                }),
                enemies: vec![],
                obstacles: self.obstacles().clone(),
                password_gates: vec![],
                data_terminals: vec![],
                telepads: vec![Telepad::new((3, 4), (8, 4), Orientation::Left)],
            },
            State {
                player: Player::new(0, 4, 10, Orientation::Right),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 11, y: 4 },
                }),
                enemies: vec![],
                obstacles: self.obstacles().clone(),
                password_gates: vec![],
                data_terminals: vec![],
                telepads: vec![Telepad::new((3, 4), (8, 4), Orientation::Right)],
            },
        ]
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
    // TODO(albrow): Add tests.

    // use super::*;
    // use crate::constants::ERR_OUT_OF_FUEL;
    // use crate::levels::Outcome;

    // #[test]
    // fn level() {
    //     let mut game = crate::Game::new();
    //     const LEVEL: &'static dyn Level = &TelepadPartOne {};

    //     // Running the initial code should result in Outcome::Continue.
    //     let script = LEVEL.initial_code();
    //     let result = game
    //         .run_player_script_internal(script.to_string(), LEVEL)
    //         .unwrap();
    //     assert_eq!(result.outcome, Outcome::Continue);

    //     // Running this code should result in Outcome::Success.
    //     let script = "move_forward(3); turn_right(); move_forward(3);";
    //     let result = game
    //         .run_player_script_internal(script.to_string(), LEVEL)
    //         .unwrap();
    //     assert_eq!(result.outcome, Outcome::Success);
    // }
}
