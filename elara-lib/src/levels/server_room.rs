use std::collections::HashSet;

use super::{Level, LevelStyle, Outcome};
use crate::{
    constants::ERR_OUT_OF_ENERGY,
    simulation::{
        Actor, Button, ButtonConnection, DataPoint, EnergyCell, Obstacle, ObstacleKind,
        Orientation, Player, State,
    },
};

lazy_static! {
    static ref MESSAGES: Vec<&'static str> = vec![
        r"{markdown}
\== _Chat Logs 2063.09.29_ \==

**Ada**: Hey I heard you've been working on the infinite loop detector?

**Alan**: That's right! We can now detect an infinite loop and report it as an error before the code even runs. Should help prevent our engineer's computers from crashing. So far I've tested it with loops and while loops.

**Ada**: Cool cool. Some engineers might also use recursion as a way to repeat their code. Did you test for that?

**Alan**: Oh, I almost forgot. Let me search online to remind myself how recursion works...
",
        r#"{markdown}
\== _Chat Logs 2063.10.01_ \==

**George**: I was watching the rovers while they were in "automated cleaning mode" earlier and I noticed something. It seems like while in this mode they are not able to move backward. Is that intentional?

**Mary**: Hang on...

**Mary**: I just looked over the code and I think you're right. Instead of moving backward they just turn twice, which takes longer. I'll make a note of this, but I'm not sure if we'll have the time to fix it.

**George**: Gotcha. As long as the rovers are able to do their job while cleaning, it's not the end of the world if they take a little longer to do it. I'm okay with de-prioritizing this for now.
"#,
        r"{markdown}
\== _Chat Logs 2063.10.02_ \==

**Mary**: Any resident CSS experts available to help me with something? I'm just trying to have a tooltip that floats above a button, but I don't want it to hang off the edge of the screen. I want it to be repositioned so that it's always visible.

**Alan**: I think @Ada has the most practice with the dark arts.

**Ada**: Lol honestly I usually just keep trying things until it works. But happy to take a look and see if I can help!
",
        r#"{markdown}
\== _Chat Logs 2063.10.05_ \==

**Alan**: I heard someone mention the idea of a `wait` function which would just cause the rovers to wait and do nothing. What do you think?

**Marie**: Hmm.. we should try to keep the number of built-in functions to a minimum. Couldn't you do basically the same thing with `say("waiting")`?

**Alan**: Yeah, I guess you're right! I'll advise them to do that instead.
"#,
        r"{markdown}

\== _Chat Logs 2063.10.09_ \==

**Marie**: There are two hard problems in computer science...

**Marie**: ...cache invalidation, naming things, and off-by-one errors.

**Alan**: Uh oh, here we go again. Can't we just make a separate channel for jokes?

**Mary**: rofl.gif [image not found]

**Alan**: I'm pretty sure there are more than two hard problems in computer science.
",
        r"{markdown}

\== _Chat Logs 2063.10.12_ \==

**George**: Why do we even need an emergency shutdown button? The rovers aren't dangerous, are they? I mean aside from G.R.E.T.A. they're not even that big.

**Mary**: It's just a precaution. We don't expect anything to go wrong, but it's better to be safe than sorry.

**George**: I guess that makes sense. I'm just worried that someone might press it by accident. Can't we put it somewhere less conspicuous?

**Ada**: That would defeat the purpose. It needs to be somewhere that's easy to find in an emergency.
",
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
    fn style(&self) -> LevelStyle {
        LevelStyle::GlossyTiles
    }
    fn camera_text(&self) -> &'static str {
        "Moonbase Alpha: Interior Camera A"
    }
    fn objective(&self) -> &'static str {
        "Press the button ({button}) to shut down the servers."
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
        Some("Use the `say` function to read the messages on every data point.")
    }
    fn check_challenge(
        &self,
        states: &[State],
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
        assert!(!result.passes_challenge);

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
        assert!(result.passes_challenge);

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
        assert!(!result.passes_challenge);
    }
}
