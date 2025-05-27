use super::{std_check_win, Level, Outcome};
use crate::actors::AsteroidActor;
use crate::simulation::{Actor, AsteroidWarning, DataPoint, Orientation};
use crate::simulation::{Goal, Obstacle, Player, State};
use crate::state_maker::StateMaker;

const DATA_POINT_INFO: &str = r#"This data point will output either `"top"`, `"middle"`, or `"bottom"` depending on which way is safe to go."#;

#[derive(Copy, Clone)]
pub struct AsteroidStrikePartTwo {}

impl AsteroidStrikePartTwo {
    // Note: We make obstacles a method so we can re-use the same set of
    // obstacles for each possible state.
    fn obstacles(&self) -> Vec<Obstacle> {
        vec![
            Obstacle::new(0, 2),
            Obstacle::new(0, 4),
            Obstacle::new(1, 2),
            Obstacle::new(1, 4),
            Obstacle::new(2, 2),
            Obstacle::new(2, 4),
            Obstacle::new(3, 0),
            Obstacle::new(3, 1),
            Obstacle::new(3, 2),
            Obstacle::new(3, 4),
            Obstacle::new(3, 5),
            Obstacle::new(3, 6),
            Obstacle::new(3, 7),
            Obstacle::new(4, 7),
            Obstacle::new(5, 0),
            Obstacle::new(5, 1),
            Obstacle::new(5, 2),
            Obstacle::new(5, 4),
            Obstacle::new(5, 5),
            Obstacle::new(5, 6),
            Obstacle::new(5, 7),
            Obstacle::new(6, 2),
            Obstacle::new(6, 4),
            Obstacle::new(7, 2),
            Obstacle::new(7, 4),
            Obstacle::new(8, 2),
            Obstacle::new(8, 3),
            Obstacle::new(8, 4),
        ]
    }
}

impl Level for AsteroidStrikePartTwo {
    fn name(&self) -> &'static str {
        "On Your Own"
    }
    fn short_name(&self) -> &'static str {
        "asteroid_strike_part_two"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to one of the goals ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// You'll need to read the safe direction from the data point
// (either "top", "middle", or "bottom") and then move the rover
// to the corresponding goal.
//
// ADD YOUR CODE BELOW
"#
    }
    fn initial_states(&self) -> Vec<State> {
        vec![
            StateMaker::new()
                .with_player(Player::new(1, 3, 10, Orientation::Right))
                .with_goals(vec![Goal::new(4, 0), Goal::new(7, 3), Goal::new(4, 6)])
                .with_obstacles(self.obstacles())
                .with_asteroid_warnings(vec![
                    AsteroidWarning::new(4, 2, 4, false),
                    AsteroidWarning::new(4, 4, 4, true),
                    AsteroidWarning::new(5, 3, 3, true),
                ])
                .with_data_points(vec![DataPoint::new_with_info(
                    0,
                    3,
                    "top".into(),
                    DATA_POINT_INFO.into(),
                )])
                .build(),
            StateMaker::new()
                .with_player(Player::new(1, 3, 10, Orientation::Right))
                .with_goals(vec![Goal::new(4, 0), Goal::new(7, 3), Goal::new(4, 6)])
                .with_obstacles(self.obstacles())
                .with_asteroid_warnings(vec![
                    AsteroidWarning::new(4, 2, 4, true),
                    AsteroidWarning::new(4, 4, 4, true),
                    AsteroidWarning::new(5, 3, 3, false),
                ])
                .with_data_points(vec![DataPoint::new_with_info(
                    0,
                    3,
                    "middle".into(),
                    DATA_POINT_INFO.into(),
                )])
                .build(),
            StateMaker::new()
                .with_player(Player::new(1, 3, 10, Orientation::Right))
                .with_goals(vec![Goal::new(4, 0), Goal::new(7, 3), Goal::new(4, 6)])
                .with_obstacles(self.obstacles())
                .with_asteroid_warnings(vec![
                    AsteroidWarning::new(4, 2, 4, true),
                    AsteroidWarning::new(4, 4, 4, false),
                    AsteroidWarning::new(5, 3, 3, true),
                ])
                .with_data_points(vec![DataPoint::new_with_info(
                    0,
                    3,
                    "bottom".into(),
                    DATA_POINT_INFO.into(),
                )])
                .build(),
        ]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(AsteroidActor::new())]
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
        const LEVEL: &'static dyn Level = &AsteroidStrikePartTwo {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success because we
        // are accounting for all three possible directions.
        let script = r#"
            let safe_direction = read_data();
            move_forward(3);
            if safe_direction == "top" {
                turn_left();
            }
            if safe_direction == "bottom" {
                turn_right();
            }
            move_forward(3);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Hard-coding the movement direction should always result in failure.
        // In this specific case, it should be Outcome::Continue because we didn't
        // run out of energy, but we didn't reach the goal either.
        let script = r"move_forward(6);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r"move_forward(3);
            turn_right();
            move_forward(3);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r"move_forward(3);
        turn_left();
        move_forward(3);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }
}
