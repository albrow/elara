use super::{make_all_initial_states_for_telepads, std_check_win, Level, Outcome};
use crate::{
    actors::{BigEnemyActor, Bounds},
    script_runner::ScriptStats,
    simulation::{
        Actor, BigEnemy, Button, ButtonConnection, DataPoint, EnergyCell, Gate, GateVariant, Goal,
        Obstacle, Orientation, OrientationWithDiagonals, PasswordGate, Player, PlayerAnimState,
        State, Telepad,
    },
    state_maker::StateMaker,
};

lazy_static! {
    // Possible passwords for the password gate.
    // We use an array here to stop players from cheating by knowing the password
    // ahead of time. Note it's still possible to cheat but it's a little harder and
    // would require trying all of the possible passwords.
    static ref POSSIBLE_PASSWORDS: Vec<&'static str> = vec!["carver", "curie", "vaughan"];
}

#[derive(Copy, Clone)]
pub struct BigEnemyLevel {}

impl Level for BigEnemyLevel {
    fn name(&self) -> &'static str {
        "Big Trouble"
    }
    fn short_name(&self) -> &'static str {
        "big_enemy"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// You can use this face_direction function to have G.R.O.V.E.R.
// face any direction you want! For example, to face up, you would
// call face_direction("up").
fn face_direction(direction) {
  while get_orientation() != direction {
    turn_left();
  }
}

// ADD YOUR CODE BELOW:
"#
    }
    fn initial_states(&self) -> Vec<State> {
        // Create one possible state for each password.
        let base_states = POSSIBLE_PASSWORDS
            .clone()
            .into_iter()
            .map(|password| {
                StateMaker::new()
                    .with_player(Player::new(4, 7, 20, Orientation::Up))
                    .with_goals(vec![Goal::new(6, 2)])
                    .with_energy_cells(vec![
                        EnergyCell::new(5, 0),
                        EnergyCell::new(5, 5),
                        EnergyCell::new(0, 3),
                        EnergyCell::new(11, 6),
                    ])
                    .with_obstacles(vec![
                        Obstacle::new(1, 5),
                        Obstacle::new(2, 1),
                        Obstacle::new(2, 5),
                        Obstacle::new(3, 1),
                        Obstacle::new(7, 1),
                        Obstacle::new(7, 5),
                        Obstacle::new(8, 1),
                        Obstacle::new(8, 5),
                        Obstacle::new(9, 1),
                        Obstacle::new(9, 5),
                        Obstacle::new(10, 1),
                        Obstacle::new(10, 2),
                        Obstacle::new(10, 3),
                        Obstacle::new(10, 4),
                        Obstacle::new(10, 5),
                        Obstacle::new(11, 1),
                    ])
                    .with_big_enemies(vec![BigEnemy::new(3, 2, OrientationWithDiagonals::Down)])
                    .with_telepads(vec![
                        Telepad::new((0, 7), (0, 0), Orientation::Up),
                        Telepad::new((11, 0), (11, 7), Orientation::Up),
                    ])
                    .with_buttons(vec![Button::new_with_info(
                        11,
                        2,
                        ButtonConnection::Gate(0),
                        "Press this button to lock/unlock one of the gates.".into(),
                    )])
                    .with_gates(vec![Gate::new_with_info(
                        6,
                        3,
                        true,
                        GateVariant::NESW,
                        "This gate can be locked/unlocked by pressing the nearby button.".into(),
                    )])
                    .with_data_points(vec![DataPoint::new_with_info(
                        1,
                        1,
                        password.into(),
                        "This data point will output the password for the password gate.".into(),
                    )])
                    .with_password_gates(vec![PasswordGate::new_with_info(
                        11,
                        5,
                        password.into(),
                        false,
                        GateVariant::NWSE,
                        "The password for this gate can be found in the nearby data point.".into(),
                    )])
                    .build()
            })
            .collect();

        // Then fill in the rest of the states to include all possible telepad orientations.
        make_all_initial_states_for_telepads(base_states)
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(BigEnemyActor::new(0, Bounds::default()))]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Reach the goal without using any telepads.")
    }
    fn check_challenge(&self, states: &[State], _script: &str, _stats: &ScriptStats) -> bool {
        for state in states {
            if let PlayerAnimState::Teleporting(_) = state.player.anim_state {
                return false;
            }
        }
        true
    }
}

// TODO(albrow): Add more test cases.
#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &BigEnemyLevel {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            fn face_direction(direction) {
                while get_orientation() != direction {
                turn_left();
                }
            }
            
            turn_left();
            move_forward(4);
            face_direction("right");
            move_forward(1);
            let password = read_data();
            move_forward(10);
            face_direction("up");
            move_forward(1);
            say(password);
            move_forward(3);
            press_button();
            move_backward(3);
            turn_left();
            move_forward(6);
            turn_right();
            move_forward(4);
            turn_right();
            move_forward(1);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &BigEnemyLevel {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r#"
            fn face_direction(direction) {
                while get_orientation() != direction {
                turn_left();
                }
            }
            
            turn_left();
            move_forward(4);
            face_direction("right");
            move_forward(1);
            let password = read_data();
            move_forward(10);
            face_direction("up");
            move_forward(1);
            say(password);
            move_forward(3);
            press_button();
            move_backward(3);
            turn_left();
            move_forward(6);
            turn_right();
            move_forward(4);
            turn_right();
            move_forward(1);"#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // This code satisfies the challenge conditions.
        let script = r"
            turn_left();
            move_forward(3);
            turn_right();
            move_forward(1);
            turn_left();
            move_forward(1);
            turn_right();
            move_forward(5);
            let password = read_data();
            move_backward(5);
            turn_right();
            move_forward(11);
            turn_left();
            say(password);
            move_forward(3);
            press_button();
            move_backward(3);
            turn_left();
            move_forward(6);
            turn_right();
            move_forward(4);
            turn_right();
            move_forward(1);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);
    }
}
