use super::{std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, DataPoint, GateVariant, Goal, Obstacle, Orientation, PasswordGate, Player, State,
};

#[derive(Copy, Clone)]
pub struct GateAndDataPointArray {}

impl Level for GateAndDataPointArray {
    fn name(&self) -> &'static str {
        "Needle in a Haystack"
    }
    fn short_name(&self) -> &'static str {
        "gate_and_data_point_array"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// This data point holds an array instead of just a string.
let array = read_data();

// The password is at index 2 in the array. Once you get the
// password, you know what to do!
//
// ADD YOUR CODE BELOW

"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(10, 6, 10, Orientation::Left);
        state.goals = vec![Goal::new(5, 6)];
        state.obstacles = vec![
            Obstacle::new(7, 5),
            Obstacle::new(7, 7),
            Obstacle::new(8, 5),
            Obstacle::new(8, 7),
            Obstacle::new(9, 5),
            Obstacle::new(9, 7),
            Obstacle::new(10, 5),
            Obstacle::new(10, 7),
            Obstacle::new(11, 5),
            Obstacle::new(11, 7),
        ];
        state.password_gates = vec![PasswordGate::new_with_info(
            7,
            6,
            "vaughan".to_string(),
            false,
            GateVariant::NESW,
            "The nearby data point holds an array. The password for this gate is stored at index `2` of the array.".into(),
        )];
        state.data_points = vec![DataPoint::new_with_info(
            11,
            6,
            vec![
                "HTTP ERROR 418",
                "Ingredients: 500g freeze-dried spinach, 5g ground coriander, 30g coconut milk powder...",
                "vaughan",
                "42",
            ]
            .into(),
            "This data point holds an array. The password is stored at index `2` of the array.".into(),
        )];
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
        const LEVEL: &'static dyn Level = &GateAndDataPointArray {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            let array = read_data();
            move_forward(2);
            say(array[2]);
            move_forward(3);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
