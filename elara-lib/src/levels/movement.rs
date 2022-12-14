use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct Movement {}

impl Level for Movement {
    fn name(&self) -> &'static str {
        "First Steps"
    }
    fn short_name(&self) -> &'static str {
        "movement"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// The code below moves the rover, but it's not going to the
// right place. Try changing the code to see what happens.

move_right(1);
move_down(2);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 0, 10);
        state.goal = Some(Goal {
            pos: Pos { x: 3, y: 3 },
        });
        state.obstacles = vec![
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
        ];
        vec![state]
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
        const LEVEL: &'static dyn Level = &Movement {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = "move_right(3); move_down(3);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
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
            .run_player_script_internal(script.to_string(), LEVEL)
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
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Now try moving too far down.
        let script = "move_down(5); move_right(3);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
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
            .run_player_script_internal(script.to_string(), LEVEL)
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
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
    }
}
