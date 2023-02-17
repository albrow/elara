use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, Direction};
use crate::simulation::{Goal, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct GlitchesPartTwo {}

impl Level for GlitchesPartTwo {
    fn name(&self) -> &'static str {
        "Even More Trouble"
    }
    fn short_name(&self) -> &'static str {
        "glitches_part_two"
    }
    fn objective(&self) -> &'static str {
        "Determine your position, then move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// The code below almost works, but it's not quite finished.
let goal = [6, 3];

while get_pos()[0] < goal[0] {
  // While our x position is less than the goal's x position,
  // we need to keep moving right.
  move_right(1);
}
while get_pos()[0] > goal[0] {
  // While our x position is greater than the goal's x position,
  // we need to keep moving left.
  move_left(1);
}

// Add more "while loops" to complete the code. (Hint: We need 
// to check our y position too.)
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![
            State {
                player: Player::new(0, 0, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(4, 0, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(8, 0, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(0, 3, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(0, 7, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(11, 0, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(11, 4, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(11, 7, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(7, 7, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
            },
            State {
                player: Player::new(3, 7, 10, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
                password_gates: vec![],
                data_terminals: vec![],
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
    use super::*;
    use crate::constants::ERR_OUT_OF_FUEL;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &GlitchesPartTwo {};

        // Running the initial code should result in Outcome::Failure due to
        // being destroyed by a bug.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success because we
        // are accounting for both possible positions.
        let script = r#"let goal = [6, 3];
            while get_pos()[0] < goal[0] {
                move_right(1);
            }
            while get_pos()[0] > goal[0] {
                move_left(1);
            }
            while get_pos()[1] < goal[1] {
                move_down(1);
            }
            while get_pos()[1] > goal[1] {
                move_up(1);
            }"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Hard-coding the movement direction should always result in failure.
        let script = r"while true {
            move_right(1);
            move_up(1);
        }";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
        let script = r"while true {
            move_left(1);
            move_down(1);
        }";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
    }
}
