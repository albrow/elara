use super::{make_all_initial_states_for_telepads, std_check_win, Level, Outcome};
use crate::{
    simulation::{
        Actor, Button, ButtonConnection, EnergyCell, Gate, GateVariant, Goal, Obstacle,
        Orientation, Player, State, Telepad,
    },
    state_maker::StateMaker,
};

#[derive(Copy, Clone)]
pub struct TelepadAndButtonGate {}

impl Level for TelepadAndButtonGate {
    fn name(&self) -> &'static str {
        "Hidden Passage"
    }
    fn short_name(&self) -> &'static str {
        "telepad_and_button_gate"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal})."
    }
    fn initial_code(&self) -> &'static str {
        r#"turn_right();
move_forward(3);
// ADD CODE BELOW:
"#
    }

    fn initial_states(&self) -> Vec<State> {
        let base_state = StateMaker::new()
            .with_player(Player::new(5, 1, 10, Orientation::Down))
            .with_goals(vec![Goal::new(5, 4)])
            .with_energy_cells(vec![EnergyCell::new(8, 3)])
            .with_obstacles(vec![
                Obstacle::new(1, 0),
                Obstacle::new(1, 1),
                Obstacle::new(1, 2),
                Obstacle::new(2, 0),
                Obstacle::new(2, 2),
                Obstacle::new(3, 0),
                Obstacle::new(3, 2),
                Obstacle::new(4, 0),
                Obstacle::new(4, 2),
                Obstacle::new(4, 3),
                Obstacle::new(4, 4),
                Obstacle::new(4, 5),
                Obstacle::new(5, 5),
                Obstacle::new(6, 0),
                Obstacle::new(6, 1),
                Obstacle::new(6, 2),
                Obstacle::new(6, 3),
                Obstacle::new(6, 4),
                Obstacle::new(6, 5),
                Obstacle::new(7, 0),
                Obstacle::new(7, 2),
                Obstacle::new(7, 3),
                Obstacle::new(7, 4),
                Obstacle::new(7, 5),
                Obstacle::new(8, 0),
                Obstacle::new(8, 5),
                Obstacle::new(9, 0),
                Obstacle::new(9, 2),
                Obstacle::new(9, 3),
                Obstacle::new(9, 4),
                Obstacle::new(9, 5),
                Obstacle::new(10, 0),
                Obstacle::new(10, 2),
                Obstacle::new(11, 0),
                Obstacle::new(11, 1),
                Obstacle::new(11, 2),
            ])
            .with_telepads(vec![
                Telepad::new((2, 1), (7, 1), Orientation::Up),
                Telepad::new((8, 4), (5, 0), Orientation::Up),
            ])
            .with_buttons(vec![Button::new_with_info(
                10,
                1,
                ButtonConnection::Gate(0),
                "Press this button to unlock the gate.".into(),
            )])
            .with_gates(vec![Gate::new_with_info(
                5,
                3,
                false,
                GateVariant::NESW,
                "This gate can be unlocked by pressing the nearby button.".into(),
            )])
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
        const LEVEL: &'static dyn Level = &TelepadAndButtonGate {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r#"
            turn_right();
            move_forward(3);
            while get_orientation() != "right" {
                turn_left();
            }
            move_forward(2);
            press_button();
            move_backward(1);
            turn_right();
            move_forward(3);
            while get_orientation() != "down" {
                turn_left();
            }
            move_forward(4);
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }
}
