use super::{std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, DataPoint, GateVariant, Goal, Obstacle, Orientation, PasswordGate, Player, Pos, State,
};

#[derive(Copy, Clone)]
pub struct GateAndDataPoint {}

impl Level for GateAndDataPoint {
    fn name(&self) -> &'static str {
        "Забытый пароль"
    }
    fn short_name(&self) -> &'static str {
        "gate_and_data_point"
    }
    fn objective(&self) -> &'static str {
        "Переместите ровер ({robot}) к цели ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Этот код читает пароль из точки данных и
// сохраняет его в переменную password. (Эту часть
// изменять НЕ нужно).
move_forward(1);
let password = read_data();

// Теперь вам нужно открыть шлюз и добраться до цели.
// ДОБАВЬТЕ ВАШ КОД НИЖЕ

"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(5, 0, 10, Orientation::Down);
        state.goals = vec![Goal {
            pos: Pos { x: 5, y: 5 },
        }];
        state.obstacles = vec![
            Obstacle::new(4, 0),
            Obstacle::new(4, 2),
            Obstacle::new(4, 3),
            Obstacle::new(6, 3),
            Obstacle::new(6, 0),
            Obstacle::new(6, 1),
            Obstacle::new(6, 2),
        ];
        state.password_gates = vec![PasswordGate::new_with_info(
            5,
            3,
            "turing".to_string(),
            false,
            GateVariant::NESW,
            "Пароль для этого шлюза хранится в ближайшей точке данных.".into(),
        )];
        state.data_points = vec![DataPoint::new_with_info(
            4,
            1,
            "turing".into(),
            "Эта точка данных содержит нужный вам пароль.".into(),
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
    use crate::constants::ERR_NO_DATA_POINT;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &GateAndDataPoint {};

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
            move_forward(3);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        // Regression check for a bug where read_data was not correctly
        // adding a position to result.positions, resulting in a length
        // mismatch.
        assert_eq!(result.states.len(), result.trace.len());

        // Calling read_data when we are not next to a data point
        // should result in an error.
        let script = r#"
            let password = read_data();
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        // result.outcome should be Outcome::Failure and the message
        // should contain ERR_NO_DATA_POINT.
        match result.outcome {
            Outcome::Failure(msg) => {
                assert!(msg.to_string().contains(ERR_NO_DATA_POINT));
            }
            _ => {
                panic!("Expected Outcome::Failure, got {:?}", result.outcome);
            }
        }
    }
}
