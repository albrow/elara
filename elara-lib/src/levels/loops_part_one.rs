use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, FuelSpot, Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct LoopsPartOne {}

impl Level for LoopsPartOne {
    fn name(&self) -> &'static str {
        "Loop the Loop"
    }
    fn short_name(&self) -> &'static str {
        "loops_part_one"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal}) using a loop."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Instead of writing the same code over and over, you can
// use a "loop". When using a loop, all the code inside the
// two curly brackets "{" and "}" will be repeated.

loop {
  move_right(1);
  // Try changing the line of code below so that the
  // rover moves in the right direction:
  move_left(1);
}
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 7, 5);
        state.fuel_spots = vec![FuelSpot::new(3, 5)];
        state.goal = Some(Goal {
            pos: Pos::new(8, 0),
        });
        state.obstacles = vec![
            Obstacle::new(0, 6),
            Obstacle::new(0, 5),
            Obstacle::new(1, 5),
            Obstacle::new(1, 4),
            Obstacle::new(2, 4),
            Obstacle::new(2, 3),
            Obstacle::new(3, 3),
            Obstacle::new(3, 2),
            Obstacle::new(4, 2),
            Obstacle::new(4, 1),
            Obstacle::new(5, 1),
            Obstacle::new(5, 0),
            Obstacle::new(6, 0),
            Obstacle::new(2, 7),
            Obstacle::new(3, 7),
            Obstacle::new(3, 6),
            Obstacle::new(4, 6),
            Obstacle::new(4, 5),
            Obstacle::new(5, 5),
            Obstacle::new(5, 4),
            Obstacle::new(6, 4),
            Obstacle::new(6, 3),
            Obstacle::new(7, 3),
            Obstacle::new(7, 2),
            Obstacle::new(8, 2),
            Obstacle::new(8, 1),
            Obstacle::new(9, 1),
            Obstacle::new(9, 0),
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
        const LEVEL: &'static dyn Level = &LoopsPartOne {};

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
        let script = r"loop {
            move_right(1);
            move_up(1);
        }";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
