use crate::constants::ERR_OUT_OF_FUEL;
use crate::levels::{Level, Outcome};
use crate::simulation::Actor;
use crate::simulation::{Goal, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct MoreTrouble {}

impl Level for MoreTrouble {
    fn name(&self) -> &'static str {
        "Even More Trouble"
    }
    fn objective(&self) -> &'static str {
        "Determine your position, then move the rover (🤖) to the goal (🏁)."
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
                player: Player::new(0, 0, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player::new(4, 0, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player::new(8, 0, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player::new(0, 3, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player::new(0, 7, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player::new(11, 0, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player::new(11, 4, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player::new(11, 7, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player::new(7, 7, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
            State {
                player: Player::new(3, 7, 10),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 6, y: 3 },
                }),
                enemies: vec![],
                obstacles: vec![],
            },
        ]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        if state.player.pos == state.goal.as_ref().unwrap().pos {
            Outcome::Success
        } else if state.player.fuel == 0 {
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        } else {
            Outcome::Continue
        }
    }
    fn new_core_concepts(&self) -> Vec<&'static str> {
        vec!["While Loop"]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::ERR_OUT_OF_FUEL;
    use crate::levels::{level_index_by_name, Outcome, LEVELS};

    #[test]
    fn level_six() {
        let mut game = crate::Game::new();
        let level_index = level_index_by_name(MoreTrouble {}.name());

        // Running the initial code should result in Outcome::Failure due to
        // being destroyed by a bug.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
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
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Hard-coding the movement direction should always result in failure.
        let script = r"while true {
            move_right(1);
            move_up(1);
        }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
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
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
    }
}
