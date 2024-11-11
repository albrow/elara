use super::{make_all_initial_states_for_telepads, std_check_win, Level, Outcome};
use crate::{
    script_runner::ScriptStats,
    simulation::{Actor, EnergyCell, Goal, Obstacle, Orientation, Player, State, Telepad},
    state_maker::StateMaker,
};

#[derive(Copy, Clone)]
pub struct TelepadsAndWhileLoop {}

impl Level for TelepadsAndWhileLoop {
    fn name(&self) -> &'static str {
        "Up and Up and Up"
    }
    fn short_name(&self) -> &'static str {
        "telepads_and_while_loop"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"// This function uses a while loop to make G.R.O.V.E.R. face
// up no matter which orientation he starts in.
// You DON'T need to change this part.
fn face_up() {
  while get_orientation() != "up" {
    turn_left();
  }
}

// You can use the face_up function after G.R.O.V.E.R. goes
// through a telepad. Here's an example to help you get started:
move_forward(2);
face_up();
move_forward(3);
// ADD YOUR CODE BELOW:

"#
    }

    fn initial_states(&self) -> Vec<State> {
        let base_state = StateMaker::new()
            .with_player(Player::new(2, 6, 8, Orientation::Up))
            .with_goals(vec![Goal::new(8, 1)])
            .with_obstacles(vec![
                Obstacle::new(1, 4),
                Obstacle::new(1, 5),
                Obstacle::new(1, 6),
                Obstacle::new(3, 3),
                Obstacle::new(3, 4),
                Obstacle::new(3, 5),
                Obstacle::new(3, 6),
                Obstacle::new(5, 2),
                Obstacle::new(5, 3),
                Obstacle::new(5, 4),
                Obstacle::new(5, 5),
                Obstacle::new(5, 6),
                Obstacle::new(7, 1),
                Obstacle::new(7, 2),
                Obstacle::new(7, 3),
                Obstacle::new(7, 4),
                Obstacle::new(7, 5),
                Obstacle::new(7, 6),
                Obstacle::new(9, 1),
                Obstacle::new(9, 2),
                Obstacle::new(9, 3),
                Obstacle::new(9, 4),
                Obstacle::new(9, 5),
                Obstacle::new(9, 6),
            ])
            .with_energy_cells(vec![EnergyCell::new(6, 4)])
            .with_telepads(vec![
                Telepad::new((2, 4), (4, 6), Orientation::Up),
                Telepad::new((4, 3), (6, 6), Orientation::Up),
                Telepad::new((6, 2), (8, 6), Orientation::Up),
            ])
            .build();
        make_all_initial_states_for_telepads(vec![base_state])
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Complete the objective in 17 or fewer steps.")
    }
    fn check_challenge(&self, _states: &[State], _script: &str, stats: &ScriptStats) -> bool {
        stats.time_taken <= 17
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &TelepadsAndWhileLoop {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            fn face_up() {
                while get_orientation() != "up" {
                    turn_left();
                }
            }
            
            move_forward(2);
            face_up();
            move_forward(3);
            face_up();
            move_forward(4);
            face_up();
            move_forward(5);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}

#[test]
fn challenge() {
    let mut game = crate::Game::new();
    const LEVEL: &'static dyn Level = &TelepadsAndWhileLoop {};

    // This code beats the level, but doesn't satisfy the challenge conditions.
    let script = r#"
        fn face_up() {
            while get_orientation() != "up" {
                turn_left();
            }
        }
        
        move_forward(2);
        face_up();
        move_forward(3);
        face_up();
        move_forward(4);
        face_up();
        move_forward(5);
    "#;
    let result = game
        .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
        .unwrap();
    assert_eq!(result.outcome, Outcome::Success);
    assert!(!result.passes_challenge);

    // This code should beat the level and pass the challenge.
    let script = r#"
        // This function will cause G.R.O.V.E.R. to move up in as few
        // steps as possible, regardless of which direction he is currently
        // facing.
        fn move_up(spaces) {
            let facing = get_orientation();
            // If facing down, move backward.
            if facing == "down" {
                move_backward(spaces);
                return;
            }
            // Otherwise turn to face up, then move forward.
            if facing == "left" {
                turn_right();
            }
            if facing == "right" {
                turn_left();
            }
            move_forward(spaces);
        }
        
        move_up(2);
        move_up(3);
        move_up(4);
        move_up(5);
    "#;
    let result = game
        .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
        .unwrap();
    assert_eq!(result.outcome, Outcome::Success);
    assert!(result.passes_challenge);
}
