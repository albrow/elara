use super::{std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, Button, ButtonConnection, Gate, GateVariant, Goal, Obstacle, Orientation, Player, State,
};

#[derive(Copy, Clone)]
pub struct ButtonAndGatePartTwo {}

impl Level for ButtonAndGatePartTwo {
    fn name(&self) -> &'static str {
        "Order of Operations"
    }
    fn short_name(&self) -> &'static str {
        "button_and_gate_part_two"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(7, 4, 15, Orientation::Up);
        state.buttons = vec![
            Button::new_with_info(
                7,
                6,
                ButtonConnection::Gate(0),
                "Press this button to unlock the corresponding gate.".into(),
            ),
            Button::new_with_info(
                3,
                4,
                ButtonConnection::Gate(1),
                "Press this button to unlock the corresponding gate.".into(),
            ),
        ];
        state.gates = vec![
            Gate::new_with_info(
                5,
                4,
                false,
                GateVariant::NESW,
                "This gate can be unlocked by pressing the corresponding button.".into(),
            ),
            Gate::new_with_info(
                7,
                2,
                false,
                GateVariant::NESW,
                "This gate can be unlocked by pressing the corresponding button.".into(),
            ),
        ];
        state.obstacles = vec![
            Obstacle::new(2, 3),
            Obstacle::new(2, 4),
            Obstacle::new(2, 5),
            Obstacle::new(3, 3),
            Obstacle::new(3, 5),
            Obstacle::new(4, 3),
            Obstacle::new(4, 5),
            Obstacle::new(5, 3),
            Obstacle::new(5, 5),
            Obstacle::new(6, 0),
            Obstacle::new(6, 1),
            Obstacle::new(6, 2),
            Obstacle::new(6, 3),
            Obstacle::new(6, 5),
            Obstacle::new(6, 6),
            Obstacle::new(6, 7),
            Obstacle::new(7, 7),
            Obstacle::new(8, 0),
            Obstacle::new(8, 1),
            Obstacle::new(8, 2),
            Obstacle::new(8, 3),
            Obstacle::new(8, 4),
            Obstacle::new(8, 5),
            Obstacle::new(8, 5),
            Obstacle::new(8, 6),
            Obstacle::new(8, 7),
        ];
        state.goals = vec![Goal::new(7, 0)];
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
        const LEVEL: &'static dyn Level = &ButtonAndGatePartTwo {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_backward(1);
            press_button();
            move_forward(1);
            turn_left();
            move_forward(3);
            press_button();
            move_backward(3);
            turn_right();
            move_forward(4);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
