use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, FuelSpot, Goal, Obstacle, Orientation, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct LoopsPartTwo {}

impl Level for LoopsPartTwo {
    fn name(&self) -> &'static str {
        "All By Yourself"
    }
    fn short_name(&self) -> &'static str {
        "loops_part_two"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal}) using a loop."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Try writing a loop on your own this time.
// Don't forget to use the loop keyword.
//
// ADD YOUR CODE BELOW
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 0, 10, Orientation::Right);
        state.fuel_spots = vec![FuelSpot::new(7, 3)];
        state.goal = Some(Goal {
            pos: Pos::new(10, 5),
        });
        state.obstacles = vec![
            Obstacle::new(0, 1),
            Obstacle::new(1, 1),
            Obstacle::new(1, 2),
            Obstacle::new(2, 2),
            Obstacle::new(3, 2),
            Obstacle::new(3, 3),
            Obstacle::new(4, 3),
            Obstacle::new(5, 3),
            Obstacle::new(5, 4),
            Obstacle::new(6, 4),
            Obstacle::new(7, 4),
            Obstacle::new(7, 5),
            Obstacle::new(8, 5),
            Obstacle::new(9, 5),
            Obstacle::new(9, 6),
            Obstacle::new(10, 6),
            Obstacle::new(11, 6),
            Obstacle::new(3, 0),
            Obstacle::new(4, 0),
            Obstacle::new(5, 0),
            Obstacle::new(5, 1),
            Obstacle::new(6, 1),
            Obstacle::new(7, 1),
            Obstacle::new(7, 2),
            Obstacle::new(8, 2),
            Obstacle::new(9, 2),
            Obstacle::new(9, 3),
            Obstacle::new(10, 3),
            Obstacle::new(11, 3),
            Obstacle::new(11, 4),
            Obstacle::new(11, 5),
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
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &LoopsPartTwo {};

        // Running the initial code should result in Outcome::Continue because
        // the rover does not move at all.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r"
            loop {
                move_forward(2);
                turn_right();
                move_forward(1);
                turn_left();
            }";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
