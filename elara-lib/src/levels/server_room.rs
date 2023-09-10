use std::collections::HashSet;

use super::{Level, Outcome};
use crate::{
    constants::ERR_OUT_OF_ENERGY,
    simulation::{
        Actor, Button, ButtonConnection, DataPoint, EnergyCell, Obstacle, ObstacleKind,
        Orientation, Player, State,
    },
};

// TODO(albrow): Consider adding more messages.
// We could put whatever easter eggs we want here.
lazy_static! {
    static ref MESSAGES: Vec<&'static str> = vec![
        "2047.09.29 Dan: How's it going with the automated cleaning routines? Anything I can help with?",
        "2047.09.29 Linda: I'm having a hard time with the path-finding algorithm. I was thinking of simplifying it a bit.",
        "2047.09.29 Dan: We're already behind schedule, so I'm open to it. What did you have in mind?",
        "2047.09.29 Linda: Once the rover identifies some trash or debris, it could just move toward it in a straight line.",
        "2047.09.29 Linda: We prioritize whichever axis is farthest away. So if the target is two spaces up and one space to the left, we go up first.",
        "2047.09.29 Dan: Hmm.. the rovers might get stuck in corners and dead ends. But I guess we can always refactor it later. I say go for it!",
    ];
}

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
        state.player = Player::new(6, 7, 12, Orientation::Up);
        state.buttons = vec![Button::new_with_info(
            6,
            0,
            ButtonConnection::None,
            "Pressing this button will shutdown the servers and disable *ALL* rovers on Elara."
                .into(),
        )];
        state.energy_cells = vec![EnergyCell::new(2, 7), EnergyCell::new(6, 4)];
        state.data_points = vec![
            DataPoint::new_with_info(
                0,
                7,
                MESSAGES[0].into(),
                "This data point holds a message from the original team that built Moonbase Alpha."
                    .into(),
            ),
            DataPoint::new_with_info(
                1,
                5,
                MESSAGES[1].into(),
                "This data point holds a message from the original team that built Moonbase Alpha."
                    .into(),
            ),
            DataPoint::new_with_info(
                4,
                5,
                MESSAGES[2].into(),
                "This data point holds a message from the original team that built Moonbase Alpha."
                    .into(),
            ),
            DataPoint::new_with_info(
                8,
                3,
                MESSAGES[3].into(),
                "This data point holds a message from the original team that built Moonbase Alpha."
                    .into(),
            ),
            DataPoint::new_with_info(
                10,
                3,
                MESSAGES[4].into(),
                "This data point holds a message from the original team that built Moonbase Alpha."
                    .into(),
            ),
            DataPoint::new_with_info(
                3,
                1,
                MESSAGES[5].into(),
                "This data point holds a message from the original team that built Moonbase Alpha."
                    .into(),
            ),
        ];
        state.obstacles = vec![
            Obstacle::new_with_kind(0, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(1, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(2, 1, ObstacleKind::Server),
            // Obstacle::new_with_kind(3, 1, ObstacleKind::Server),
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
            // Obstacle::new_with_kind(8, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(9, 3, ObstacleKind::Server),
            // Obstacle::new_with_kind(10, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(11, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(0, 5, ObstacleKind::Server),
            // Obstacle::new_with_kind(1, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(2, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(3, 5, ObstacleKind::Server),
            // Obstacle::new_with_kind(4, 5, ObstacleKind::Server),
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
    fn challenge(&self) -> Option<&'static str> {
        Some("Read the messages on every data point using the say function.")
    }
    fn check_challenge(
        &self,
        states: &Vec<State>,
        _script: &str,
        _stats: &crate::script_runner::ScriptStats,
    ) -> bool {
        let mut remaining_messages: HashSet<String> =
            MESSAGES.iter().map(|s| s.to_string()).collect();
        for state in states {
            if remaining_messages.contains(&state.player.message) {
                remaining_messages.remove(&state.player.message);
            }
        }
        remaining_messages.is_empty()
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
        let script = r"
            move_forward(6);
            press_button();
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &ServerRoom {};

        // This code beats the objective but does not complete the challenge.
        let script = r"
            move_forward(6);
            press_button();
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, false);

        // Running this code should pass the challenge.
        let script = r#"
            turn_left();
            move_forward(5);
            say(read_data());
            turn_right();
            move_forward(1);
            say(read_data());
            turn_right();
            move_forward(3);
            say(read_data());
            move_forward(2);
            turn_left();
            move_forward(2);
            turn_right();
            move_forward(2);
            say(read_data());
            move_forward(2);
            say(read_data());
            move_backward(4);
            turn_left();
            move_forward(2);
            turn_left();
            move_forward(3);
            say(read_data());
            move_backward(3);
            turn_right();
            move_forward(1);
            press_button();
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, true);

        // This code should not pass the challenge because it skips the
        // last data point.
        let script = r#"
            turn_left();
            move_forward(5);
            say(read_data());
            turn_right();
            move_forward(1);
            say(read_data());
            turn_right();
            move_forward(3);
            say(read_data());
            move_forward(2);
            turn_left();
            move_forward(2);
            turn_right();
            move_forward(2);
            say(read_data());
            move_forward(2);
            say(read_data());
            move_backward(4);
            turn_left();
            move_forward(2);
            turn_left();
            move_forward(3);
            // say(read_data());
            move_backward(3);
            turn_right();
            move_forward(1);
            press_button();
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, false);
    }
}
