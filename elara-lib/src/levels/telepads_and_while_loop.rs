use super::{make_all_initial_states_for_telepads, std_check_win, Level, Outcome};
use crate::{
    simulation::{Actor, Goal, Obstacle, Orientation, Player, State, Telepad},
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

// You can use the face_up function to help you navigate
// to the goal. Here's an example:
move_forward(2);
face_up();
move_forward(3);

// ADD YOUR CODE BELOW:

"#
    }

    fn initial_states(&self) -> Vec<State> {
        let base_state = StateMaker::new()
            .with_player(Player::new(2, 6, 14, Orientation::Up))
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
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            // This function uses a while loop to make G.R.O.V.E.R. face
            // up no matter which orientation he starts in. You DON'T
            // need to change this code.
            fn face_up() {
            while get_orientation() != "up" {
                turn_left();
            }
            }
            
            // You can use the face_up function to help you navigate
            // to the goal. Here's an example:
            move_forward(2);
            face_up();
            move_forward(3);
            
            // ADD YOUR CODE BELOW:
            face_up();
            move_forward(4);
            face_up();
            move_forward(5);
        "#;
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
