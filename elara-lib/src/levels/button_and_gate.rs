use super::{Level, Outcome, AVAIL_FUNCS_WITH_PRESS};
use crate::{
    constants::ERR_OUT_OF_FUEL,
    simulation::{
        Actor, Button, ButtonConnection, Gate, Goal, Obstacle, Orientation, Player, State,
    },
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
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAIL_FUNCS_WITH_PRESS
    }
    fn initial_code(&self) -> &'static str {
        r#"
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(11, 7, 15, Orientation::Up);
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
            "This gate is locked. To unlock it, press the nearby button.".into(),
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
        // Note that this level uses a different check_win function. There is not
        // goal to reach. Instead you beat the level by pressing the button.
        if state.player.fuel == 0 {
            Outcome::Failure(ERR_OUT_OF_FUEL.to_string())
        } else if state.buttons[0].currently_pressed {
            Outcome::Success
        } else {
            Outcome::Continue
        }
    }
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use crate::levels::Outcome;

//     #[test]
//     fn level() {
//         let mut game = crate::Game::new();
//         const LEVEL: &'static dyn Level = &ButtonAndGate {};

//         // Running the initial code should result in Outcome::Continue.
//         let script = LEVEL.initial_code();
//         let result = game
//             .run_player_script_internal(script.to_string(), LEVEL)
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Continue);

//         // Running this code should result in Outcome::Success.
//         let script = r#"
//             move_forward(2);
//             press_button();
//         "#;
//         let result = game
//             .run_player_script_internal(script.to_string(), LEVEL)
//             .unwrap();
//         assert_eq!(result.outcome, Outcome::Success);
//     }
// }
