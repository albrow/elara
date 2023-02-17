use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, FuelSpot, Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct FuelPartOne {}

impl Level for FuelPartOne {
    fn name(&self) -> &'static str {
        "Fuel Up"
    }
    fn short_name(&self) -> &'static str {
        "fuel_part_one"
    }
    fn objective(&self) -> &'static str {
        "First move the rover ({robot}) to collect the fuel ({fuel}), then move to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Try collecting some fuel before moving to the goal.

// CHANGE THE CODE BELOW
move_down(4);
move_right(4);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 0, 5);
        state.fuel_spots = vec![FuelSpot {
            pos: Pos { x: 0, y: 5 },
            collected: false,
        }];
        state.goal = Some(Goal {
            pos: Pos::new(4, 4),
        });
        state.obstacles = vec![
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
    use crate::levels::{Outcome, ERR_OUT_OF_FUEL};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &FuelPartOne {};

        // Running the initial code should result in Outcome::Failure due to
        // running out of fuel.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );

        // Running this code should result in Outcome::Success.
        let script = "move_down(5); move_up(1); move_right(4);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Player should not be able to move past the obstacles for this level.
        let script = "move_down(5); move_right(4); move_up(1);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }
}
