use super::{Level, Outcome};
use crate::{
    constants::ERR_OUT_OF_ENERGY,
    simulation::{Actor, Button, ButtonConnection, Orientation, Player, State},
};

#[derive(Copy, Clone)]
pub struct ButtonsPartOne {}

impl Level for ButtonsPartOne {
    fn name(&self) -> &'static str {
        "Нажимаем кнопки"
    }
    fn short_name(&self) -> &'static str {
        "buttons_part_one"
    }
    fn objective(&self) -> &'static str {
        "Переместите ровер ({robot}) к кнопке ({button}) и нажмите её."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Функция press_button может использоваться для нажатия кнопок,
// но только если ровер находится рядом с ней. Переместите ровер
// к кнопке и вызовите функцию press_button.
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(6, 7, 10, Orientation::Up);
        state.buttons = vec![Button::new_with_info(
            6,
            4,
            ButtonConnection::None,
            "Если вы нажмёте эту кнопку, вы пройдёте уровень!".into(),
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
