use super::{std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, DataPoint, GateVariant, Goal, Obstacle, Orientation, PasswordGate, Player, State,
};

#[derive(Copy, Clone)]
pub struct GateAndDataPointPartThree {}

impl Level for GateAndDataPointPartThree {
    fn name(&self) -> &'static str {
        "Иголка в стоге сена"
    }
    fn short_name(&self) -> &'static str {
        "gate_and_data_point_part_three"
    }
    fn objective(&self) -> &'static str {
        "Переместите ровер ({robot}) к цели ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Этот код читает данные из ближайшей точки данных и
// пытается использовать их как пароль. Однако, похоже,
// это неправильный пароль. Попробуйте другие точки данных?
//
// ИЗМЕНИТЕ КОД НИЖЕ
let password = read_data();
move_forward(1);
say(password);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(1, 0, 20, Orientation::Down);
        state.goals = vec![Goal::new(4, 1)];
        state.obstacles = vec![
            Obstacle::new(2, 0),
            Obstacle::new(2, 2),
            Obstacle::new(2, 3),
            Obstacle::new(0, 3),
            Obstacle::new(1, 3),
            Obstacle::new(2, 3),
        ];
        state.password_gates = vec![PasswordGate::new(
            2,
            1,
            "vaughan".to_string(),
            false,
            GateVariant::NWSE,
        )];
        state.data_points = vec![
            DataPoint::new(0, 0, "carver".into()),
            DataPoint::new(0, 1, "curie".into()),
            DataPoint::new(0, 2, "vaughan".into()),
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
        const LEVEL: &'static dyn Level = &GateAndDataPointPartThree {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_forward(2);
            let password = read_data();
            turn_left();
            turn_left();
            move_forward(1);
            say(password);
            turn_right();
            move_forward(3);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
