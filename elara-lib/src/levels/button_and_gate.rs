use super::{std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, Button, ButtonConnection, Gate, GateVariant, Goal, Obstacle, Orientation, Player, State,
};

#[derive(Copy, Clone)]
pub struct ButtonAndGate {}

impl Level for ButtonAndGate {
    fn name(&self) -> &'static str {
        "Let Me In"
    }
    fn short_name(&self) -> &'static str {
        "button_and_gate"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// This code tries to move the rover to the goal, but
// there's a locked gate blocking the way. Try pressing the
// button first to unlock the gate.
//
// CHANGE THE CODE BELOW:
move_forward(4);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(11, 7, 15, Orientation::Left);
        state.buttons = vec![Button::new_with_info(
            11,
            3,
            ButtonConnection::Gate(0),
            "Press this button to unlock the gate.".into(),
        )];
        state.gates = vec![Gate::new_with_info(
            9,
            7,
            false,
            GateVariant::NESW,
            "This gate can be unlocked by pressing the nearby button.".into(),
        )];
        state.obstacles = vec![
            Obstacle::new(6, 6),
            Obstacle::new(6, 7),
            Obstacle::new(7, 6),
            Obstacle::new(8, 6),
            Obstacle::new(9, 6),
            Obstacle::new(10, 2),
            Obstacle::new(10, 3),
            Obstacle::new(10, 4),
            Obstacle::new(10, 5),
            Obstacle::new(10, 6),
            Obstacle::new(11, 2),
        ];
        state.goals = vec![Goal::new(7, 7)];
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
        const LEVEL: &'static dyn Level = &ButtonAndGate {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            turn_right();
            move_forward(3);
            press_button();
            turn_left();
            turn_left();
            move_forward(3);
            turn_right();
            move_forward(4);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Running this code should also result in Outcome::Success. It just
        // uses fewer steps by moving backward.
        let script = r#"
            turn_right();
            move_forward(3);
            press_button();
            move_backward(3);
            turn_left();
            move_forward(4);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Pressing the button twice should re-lock the gate. That means
        // running this code should result in Outcome::Continue.
        let script = r#"
            turn_right();
            move_forward(3);
            press_button();
            press_button();
            move_backward(3);
            turn_left();
            move_forward(4);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }
}
