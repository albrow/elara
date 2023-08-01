use super::{Level, Outcome};
use crate::{
    constants::ERR_OUT_OF_ENERGY,
    simulation::{Actor, Button, ButtonConnection, Orientation, Player, State},
};

#[derive(Copy, Clone)]
pub struct ButtonsPartOne {}

impl Level for ButtonsPartOne {
    fn name(&self) -> &'static str {
        "Pressing Buttons"
    }
    fn short_name(&self) -> &'static str {
        "buttons_part_one"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) next to the button ({button}) and press it."
    }
    fn initial_code(&self) -> &'static str {
        r#"// The press_button function can be used to press buttons,
// but only if the rover is right next to one. Move the rover
// next to the button and call the press_button function.
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(6, 7, 10, Orientation::Up);
        state.buttons = vec![Button::new_with_info(
            6,
            4,
            ButtonConnection::None,
            "If you press this button, you win the level!".into(),
        )];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        // Note that this level uses a different check_win function. There is not
        // goal to reach. Instead you beat the level by pressing the button.
        if state.player.energy == 0 {
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        } else if state.buttons[0].currently_pressed {
            Outcome::Success
        } else {
            Outcome::Continue
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &ButtonsPartOne {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_forward(2);
            press_button();
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
