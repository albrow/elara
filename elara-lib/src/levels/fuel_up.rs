use crate::levels::{Level, Outcome, ERR_OUT_OF_FUEL};
use crate::simulation::{Actor, FuelSpot, Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct FuelUp {}

impl Level for FuelUp {
    fn name(&self) -> &'static str {
        "Fuel Up"
    }
    fn objective(&self) -> &'static str {
        "First move the rover (🤖) to collect the fuel (⛽️), then move to the goal (🏁)."
    }
    fn initial_code(&self) -> &'static str {
        r#"// If you try moving straight to the goal, you'll run out of fuel
// first. Try collecting some fuel before moving to the goal.

move_down(4);
move_right(4);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![State {
            player: Player::new(0, 0, 5),
            fuel_spots: vec![FuelSpot {
                pos: Pos { x: 0, y: 5 },
                collected: false,
            }],
            goal: Some(Goal {
                pos: Pos::new(4, 4),
            }),
            enemies: vec![],
            obstacles: vec![
                // Obstacles enclose the player, goal, and fuel with a few different
                // branching paths.
                Obstacle::new(1, 1),
                Obstacle::new(1, 2),
                Obstacle::new(1, 3),
                Obstacle::new(2, 1),
                Obstacle::new(2, 2),
                Obstacle::new(2, 3),
                Obstacle::new(3, 1),
                Obstacle::new(3, 2),
                Obstacle::new(3, 3),
                Obstacle::new(5, 0),
                Obstacle::new(5, 1),
                Obstacle::new(5, 2),
                Obstacle::new(5, 3),
                Obstacle::new(5, 4),
                Obstacle::new(5, 5),
                Obstacle::new(4, 5),
                Obstacle::new(3, 5),
                Obstacle::new(2, 5),
                Obstacle::new(1, 5),
                Obstacle::new(1, 6),
                Obstacle::new(1, 7),
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::LEVELS;
    use crate::levels::{level_index_by_name, Outcome};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        let level_index = level_index_by_name(FuelUp {}.name());

        // Running the initial code should result in Outcome::Failure due to
        // running out of fuel.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );

        // Running this code should result in Outcome::Success.
        let script = "move_down(5); move_up(1); move_right(4);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.states.len(), 11);

        // Player should not be able to move past the obstacles for this level.
        let script = "move_down(5); move_right(4); move_up(1);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }
}
