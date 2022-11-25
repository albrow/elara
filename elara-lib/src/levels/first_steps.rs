use crate::levels::{Level, Outcome, ERR_OUT_OF_FUEL};
use crate::simulation::{Actor, Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct FirstSteps {}

impl Level for FirstSteps {
    fn name(&self) -> &'static str {
        "First Steps"
    }
    fn objective(&self) -> &'static str {
        "Move the rover (🤖) to the goal (🏁)."
    }
    fn initial_code(&self) -> &'static str {
        r#"// The code below moves the rover, but it's not going to the
// right place. Try changing the code to see what happens.

move_right(1);
move_down(2);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State {
            player: Player::new(0, 0, 10),
            fuel_spots: vec![],
            goal: Some(Goal {
                pos: Pos { x: 3, y: 3 },
            }),
            enemies: vec![],
            obstacles: vec![
                // Obstacles enclose the player and goal in a 4x4 square.
                Obstacle::new(4, 0),
                Obstacle::new(4, 1),
                Obstacle::new(4, 2),
                Obstacle::new(4, 3),
                Obstacle::new(4, 4),
                Obstacle::new(0, 4),
                Obstacle::new(1, 4),
                Obstacle::new(2, 4),
                Obstacle::new(3, 4),
            ],
        }]
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
        vec!["Function", "Comment"]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::ERR_OUT_OF_FUEL;
    use crate::levels::level_index_by_name;
    use crate::levels::Outcome;
    use crate::levels::LEVELS;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        let level_index = level_index_by_name(FirstSteps {}.name());

        // Running the initial code should result in Outcome::Continue.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = "move_right(3); move_down(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.states.len(), 7);

        // Running this code should result in Outcome::Failure due to running out
        // of fuel.
        let script = r"for x in 0..25 {
                move_right(1);
                move_left(1);
            }
            move_right(3);
            move_down(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );

        // Player should not be able to move past the obstacles for this level.
        // First try moving too far right. This should still be a success because
        // the player should stop moving right after hitting the obstacle at (4, 0).
        let script = "move_right(5); move_down(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Now try moving too far down.
        let script = "move_down(5); move_right(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // It is *okay* for a script to contain an infinite loop, as long as we either
        // run out of fuel or reach the objective before hitting the limitation for max
        // operations in the Rhai engine.
        // In this case, we reach the objective first, so we expect Outcome::Success.
        let script = r"move_right(3);
            move_down(3);
            while (true) {
                move_up(1);
                move_down(1);
            }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        // In this case, we don't reach the objective so we expect ERR_OUT_OF_FUEL.
        let script = r"while (true) {
                move_up(1);
                move_down(1);
            }
            move_right(3);
            move_down(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
    }
}
