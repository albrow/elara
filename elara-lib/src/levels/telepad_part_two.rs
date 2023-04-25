use super::{make_all_initial_states_for_telepads, std_check_win, Level, Outcome};
use crate::simulation::{
    Actor, DataTerminal, Goal, Obstacle, Orientation, PasswordGate, Player, Pos, State, Telepad,
};

#[derive(Copy, Clone)]
pub struct TelepadPartTwo {}

lazy_static! {
    static ref TELEPAD_FUNCS: Vec<&'static str> = vec![
        "move_forward",
        "move_backward",
        "turn_left",
        "turn_right",
        "say",
        "read_data",
        "get_orientation"
    ];
}

impl Level for TelepadPartTwo {
    fn name(&self) -> &'static str {
        "All Mixed Up"
    }
    fn short_name(&self) -> &'static str {
        "telepad_part_two"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &TELEPAD_FUNCS
    }
    fn initial_code(&self) -> &'static str {
        r#"// The data terminal that holds the password is on the other side
// of the telepad. Can you make it through?
"#
    }

    fn initial_states(&self) -> Vec<State> {
        let states = vec![State {
            player: Player::new(3, 1, 10, Orientation::Right),
            fuel_spots: vec![],
            goal: Some(Goal {
                pos: Pos { x: 3, y: 4 },
            }),
            enemies: vec![],
            obstacles: vec![
                Obstacle::new(0, 0),
                Obstacle::new(0, 1),
                Obstacle::new(0, 2),
                Obstacle::new(1, 0),
                Obstacle::new(1, 2),
                Obstacle::new(2, 0),
                Obstacle::new(2, 2),
                Obstacle::new(2, 3),
                Obstacle::new(2, 4),
                Obstacle::new(2, 5),
                Obstacle::new(3, 0),
                Obstacle::new(3, 5),
                Obstacle::new(4, 0),
                Obstacle::new(4, 2),
                Obstacle::new(4, 3),
                Obstacle::new(4, 4),
                Obstacle::new(4, 5),
                Obstacle::new(5, 0),
                Obstacle::new(5, 2),
                Obstacle::new(6, 0),
                Obstacle::new(6, 1),
                Obstacle::new(6, 2),
                Obstacle::new(6, 5),
                Obstacle::new(7, 4),
                Obstacle::new(7, 6),
                Obstacle::new(8, 6),
                Obstacle::new(9, 4),
                Obstacle::new(9, 6),
                Obstacle::new(10, 5),
            ],
            password_gates: vec![PasswordGate::new(3, 3, "carver".to_string(), false)],
            data_terminals: vec![DataTerminal::new(8, 4, "carver".into())],
            telepads: vec![
                Telepad::new((5, 1), (7, 5), Orientation::Up),
                Telepad::new((9, 5), (1, 1), Orientation::Up),
            ],
        }];
        make_all_initial_states_for_telepads(states)
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
        const LEVEL: &'static dyn Level = &TelepadPartTwo {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            fn face_right() {
                loop {
                    if get_orientation() == "right" {
                        break;
                    }
                    turn_right();
                }
            }
            
            move_forward(2);
            face_right();
            move_forward(1);
            let password = read_data();
            move_forward(1);
            face_right();
            move_forward(2);
            turn_right();
            move_forward(1);
            say(password);
            move_forward(2);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
