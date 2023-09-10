use super::{Level, Outcome};
use crate::{
    constants::ERR_OUT_OF_ENERGY,
    simulation::{
        Actor, Button, ButtonConnection, Obstacle, ObstacleKind, Orientation, Player, State,
    },
};

#[derive(Copy, Clone)]
pub struct ServerRoom {}

impl Level for ServerRoom {
    fn name(&self) -> &'static str {
        "Shutting Down"
    }
    fn short_name(&self) -> &'static str {
        "server_room"
    }
    fn objective(&self) -> &'static str {
        "Shut down the servers by pressing the button ({button})"
    }
    fn initial_code(&self) -> &'static str {
        r#"// Only one thing left to do...
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(6, 7, 20, Orientation::Up);
        state.buttons = vec![Button::new_with_info(
            6,
            0,
            ButtonConnection::None,
            "Pressing this button will shutdown the servers and disable *ALL* rovers on Elara."
                .into(),
        )];
        state.obstacles = vec![
            Obstacle::new_with_kind(0, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(1, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(2, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(3, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(4, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(5, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(7, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(8, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(9, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(10, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(11, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(0, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(1, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(2, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(3, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(4, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(5, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(7, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(8, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(9, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(10, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(11, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(0, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(1, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(2, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(3, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(4, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(5, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(7, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(8, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(9, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(10, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(11, 5, ObstacleKind::Server),
        ];
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
        const LEVEL: &'static dyn Level = &ServerRoom {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            move_forward(6);
            press_button();
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
