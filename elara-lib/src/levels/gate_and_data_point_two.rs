use super::{std_check_win, Level, Outcome};
use crate::{
    actors::{Bounds, EvilRoverActor},
    constants::{HEIGHT, WIDTH},
    simulation::{
        Actor, DataPoint, Enemy, GateVariant, Goal, Obstacle, Orientation, PasswordGate, Player,
        Pos, State,
    },
};

#[derive(Copy, Clone)]
pub struct GateAndDataPointPartTwo {}

impl Level for GateAndDataPointPartTwo {
    fn name(&self) -> &'static str {
        "Slipped My Mind"
    }
    fn short_name(&self) -> &'static str {
        "gate_and_data_point_part_two"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Yet another locked gate! Just like before, the password is
// stored in a data point. Can you get through on your own
// this time?
//
// ADD YOUR CODE BELOW
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(11, 1, 10, Orientation::Left);
        state.goals = vec![Goal {
            pos: Pos { x: 9, y: 4 },
        }];
        state.obstacles = vec![
            Obstacle::new(8, 0),
            Obstacle::new(8, 1),
            Obstacle::new(8, 2),
            Obstacle::new(8, 3),
            Obstacle::new(8, 4),
            Obstacle::new(8, 5),
            Obstacle::new(8, 6),
            Obstacle::new(8, 7),
            Obstacle::new(9, 0),
            Obstacle::new(10, 2),
            Obstacle::new(11, 0),
            Obstacle::new(11, 2),
        ];
        state.password_gates = vec![PasswordGate::new_with_info(
            9,
            2,
            "hopper".into(),
            false,
            GateVariant::NWSE,
            "The password for this gate is stored in the nearby data point.".into(),
        )];
        state.data_points = vec![DataPoint::new_with_info(
            10,
            0,
            "hopper".into(),
            "This data point contains the password you need.".into(),
        )];
        state.enemies = vec![Enemy::new(5, 0, Orientation::Right)];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(EvilRoverActor::new(
            0,
            Bounds {
                min_x: 0,
                max_x: (WIDTH - 1) as i32,
                min_y: 0,
                max_y: (HEIGHT - 1) as i32,
            },
        ))]
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
        const LEVEL: &'static dyn Level = &GateAndDataPointPartTwo {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_forward(1);
            let password = read_data();
            move_forward(1);
            say(password);
            turn_left();
            move_forward(3);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
