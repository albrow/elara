use super::{make_all_initial_states_for_telepads, std_check_win, Level, Outcome};
use crate::{
    simulation::{Actor, Goal, Obstacle, Orientation, Player, State, Telepad},
    state_maker::StateMaker,
};

#[derive(Copy, Clone)]
pub struct TelepadPartTwo {}

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
    fn initial_code(&self) -> &'static str {
        r#"// There are two sets of telepads this time. Can you make
// it through on your own?
"#
    }

    fn initial_states(&self) -> Vec<State> {
        let base_state = StateMaker::new()
            .with_player(Player::new(4, 1, 20, Orientation::Right))
            .with_goals(vec![Goal::new(1, 5)])
            .with_obstacles(vec![
                Obstacle::new(0, 5),
                Obstacle::new(1, 4),
                Obstacle::new(1, 6),
                Obstacle::new(2, 4),
                Obstacle::new(2, 6),
                Obstacle::new(3, 1),
                Obstacle::new(3, 4),
                Obstacle::new(3, 6),
                Obstacle::new(4, 0),
                Obstacle::new(4, 2),
                Obstacle::new(4, 5),
                Obstacle::new(5, 0),
                Obstacle::new(5, 2),
                Obstacle::new(6, 0),
                Obstacle::new(6, 2),
                Obstacle::new(7, 1),
                Obstacle::new(7, 5),
                Obstacle::new(8, 4),
                Obstacle::new(8, 6),
                Obstacle::new(9, 4),
                Obstacle::new(9, 6),
                Obstacle::new(10, 4),
                Obstacle::new(10, 6),
                Obstacle::new(11, 5),
            ])
            .with_telepads(vec![
                Telepad::new((6, 1), (8, 5), Orientation::Up),
                Telepad::new((10, 5), (3, 5), Orientation::Up),
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
        const LEVEL: &'static dyn Level = &TelepadPartTwo {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
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
            move_forward(2);
            face_right();
            move_backward(2);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
