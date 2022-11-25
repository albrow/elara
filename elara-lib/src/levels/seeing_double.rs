use crate::constants::ERR_OUT_OF_FUEL;
use crate::levels::{Level, Outcome};
use crate::simulation::Actor;
use crate::simulation::{Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct SeeingDouble {}

impl SeeingDouble {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        return vec![
            Obstacle::new(0, 2),
            Obstacle::new(1, 2),
            Obstacle::new(2, 2),
            Obstacle::new(3, 2),
            Obstacle::new(4, 2),
            Obstacle::new(5, 2),
            Obstacle::new(6, 2),
            Obstacle::new(7, 2),
            Obstacle::new(8, 2),
            Obstacle::new(9, 2),
            Obstacle::new(10, 2),
            Obstacle::new(11, 2),
            Obstacle::new(11, 3),
            Obstacle::new(0, 4),
            Obstacle::new(1, 4),
            Obstacle::new(2, 4),
            Obstacle::new(3, 4),
            Obstacle::new(4, 4),
            Obstacle::new(5, 4),
            Obstacle::new(6, 4),
            Obstacle::new(7, 4),
            Obstacle::new(8, 4),
            Obstacle::new(9, 4),
            Obstacle::new(10, 4),
            Obstacle::new(11, 4),
        ];
    }
}

impl Level for SeeingDouble {
    fn name(&self) -> &'static str {
        "Seeing Double"
    }
    fn objective(&self) -> &'static str {
        "Determine your position, then move the rover (🤖) to the goal (🏁)."
    }
    fn initial_code(&self) -> &'static str {
        r#"// The get_pos() function returns your current position as an
// "array". The first value represents your x position and the
// second value represents your y position.
let pos = get_pos();

// Use an "if" statement to move in a different direction depending
// on your position.
if pos[0] == 0 {
  // The code inside the curly brace will only run if the
  // condition is true, (i.e., if your x position is equal to
  // 0).
  
} else if pos[0] == 10 {
  // This code will run if your x position is equal to 10.
  
}
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![
            State {
                player: Player::new(0, 3, 5),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 5, y: 3 },
                }),
                enemies: vec![],
                obstacles: self.obstacles(),
            },
            State {
                player: Player::new(10, 3, 5),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 5, y: 3 },
                }),
                enemies: vec![],
                obstacles: self.obstacles(),
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
        vec!["Variable", "Array", "If Statement"]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::ERR_OUT_OF_FUEL;
    use crate::levels::{level_index_by_name, Outcome, LEVELS};

    #[test]
    fn level_five() {
        let mut game = crate::Game::new();
        let level_index = level_index_by_name(SeeingDouble {}.name());

        // Running the initial code should result in Outcome::Failure due to
        // being destroyed by a bug.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success because we
        // are accounting for both possible positions.
        let script = r"let pos = get_pos();
            if pos[0] == 0 {
                move_right(5);
            } else if pos[0] == 10 {
                move_left(5);
            }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Hard-coding the movement direction should always result in failure.
        let script = "move_right(5);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
        let script = "move_left(5);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );

        // Only accounting for one branch of the if statement should
        // result in failure, this time Outcome::Continue.
        let script = r"let pos = get_pos();
            if pos[0] == 0 {
                move_right(5);
            } else if pos[0] == 10 {
                // Do nothing.
            }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r"let pos = get_pos();
            if pos[0] == 0 {
                // Do nothing.
            } else if pos[0] == 10 {
                move_left(5);
            }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }
}
