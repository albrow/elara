use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, DataTerminal, Direction};
use crate::simulation::{Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct SeismicActivity {}

impl SeismicActivity {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        return vec![
            Obstacle::new(1, 1),
            Obstacle::new(1, 2),
            Obstacle::new(1, 3),
            Obstacle::new(1, 4),
            Obstacle::new(1, 5),
            Obstacle::new(1, 6),
            Obstacle::new(2, 1),
            Obstacle::new(2, 6),
            Obstacle::new(3, 1),
            Obstacle::new(3, 3),
            Obstacle::new(3, 4),
            Obstacle::new(3, 6),
            Obstacle::new(4, 0),
            Obstacle::new(4, 1),
            Obstacle::new(4, 3),
            Obstacle::new(4, 3),
            Obstacle::new(4, 4),
            Obstacle::new(4, 6),
            Obstacle::new(5, 4),
            Obstacle::new(5, 6),
            Obstacle::new(6, 0),
            Obstacle::new(6, 1),
            Obstacle::new(6, 3),
            Obstacle::new(6, 4),
            Obstacle::new(6, 6),
            Obstacle::new(7, 1),
            Obstacle::new(7, 3),
            Obstacle::new(7, 4),
            Obstacle::new(7, 6),
            Obstacle::new(8, 1),
            Obstacle::new(8, 6),
            Obstacle::new(9, 1),
            Obstacle::new(9, 2),
            Obstacle::new(9, 3),
            Obstacle::new(9, 4),
            Obstacle::new(9, 5),
            Obstacle::new(9, 6),
        ];
    }
}

impl Level for SeismicActivity {
    fn name(&self) -> &'static str {
        "Seismic Activity"
    }
    fn short_name(&self) -> &'static str {
        "seismic_activity"
    }
    fn objective(&self) -> &'static str {
        "Read from the data terminal ({terminal}) to figure out which way is safe. Then move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// This code reads the safe direction from the data terminal
// (either "left" or "right") and stores it in a variable
// called safe_direction.
move_down(2);
let safe_direction = read_data();
say("The safe direction is: " + safe_direction);

if safe_direction == "left" {
  // If the safe direction is "left", we should go left.
  move_left(3);
  move_down(3);
  move_right(3);
}
if safe_direction == "right" {
  // What should we do if the safe direction is "right"?
  // ADD YOUR CODE BELOW
  
  
  
}"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![
            State {
                player: Player::new(5, 0, 12, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 5, y: 5 },
                }),
                enemies: vec![],
                obstacles: [self.obstacles().clone(), vec![Obstacle::new(7, 2)]].concat(),
                password_gates: vec![],
                data_terminals: vec![DataTerminal::new(5, 3, String::from("left"))],
            },
            State {
                player: Player::new(5, 0, 12, Direction::Down),
                fuel_spots: vec![],
                goal: Some(Goal {
                    pos: Pos { x: 5, y: 5 },
                }),
                enemies: vec![],
                obstacles: [self.obstacles().clone(), vec![Obstacle::new(3, 2)]].concat(),
                password_gates: vec![],
                data_terminals: vec![DataTerminal::new(5, 3, String::from("right"))],
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
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &SeismicActivity {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success because we
        // are accounting for both possible directions.
        let script = r#"move_down(2);
            let safe_direction = read_data();
            if safe_direction == "left" {
                move_left(3);
                move_down(3);
                move_right(3);
            }
            if safe_direction == "right" {
                move_right(3);
                move_down(3);
                move_left(3);
            }"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Hard-coding the movement direction should always result in failure.
        // In this specific case, it should be Outcome::Continue because we didn't
        // run out of fuel, but we didn't reach the goal either.
        let script = r"move_down(2);
            move_left(3);
            move_down(3);
            move_right(3);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r"move_down(2);
            move_right(3);
            move_down(3);
            move_left(3);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Only accounting for one branch of the if statement should
        // also result in failure.
        let script = r#"move_down(2);
            let safe_direction = read_data();
            if safe_direction == "left" {
                move_left(3);
                move_down(3);
                move_right(3);
            }"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r#"move_down(2);
            let safe_direction = read_data();
            if safe_direction == "right" {
                move_right(3);
                move_down(3);
                move_left(3);
            }"#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }
}
