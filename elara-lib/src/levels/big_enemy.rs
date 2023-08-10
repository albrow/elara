use super::{make_all_initial_states_for_telepads, std_check_win, Level, Outcome};
use crate::{
    actors::{BigEnemyActor, Bounds},
    script_runner::ScriptStats,
    simulation::{
        Actor, BigEnemy, Button, ButtonConnection, DataPoint, EnergyCell, Gate, GateVariant,
        Obstacle, Orientation, OrientationWithDiagonals, PasswordGate, Player, State, Telepad,
    },
};

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
        "Find a way to disable G.R.E.T.A."
    }
    fn initial_code(&self) -> &'static str {
        r#"
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut base_state = State::new();
        base_state.player = Player::new(5, 7, 20, Orientation::Up);
        base_state.energy_cells = vec![
            EnergyCell::new(6, 0),
            EnergyCell::new(1, 6),
            EnergyCell::new(10, 6),
        ];
        base_state.obstacles = vec![
            Obstacle::new(1, 2),
            Obstacle::new(1, 5),
            Obstacle::new(2, 1),
            Obstacle::new(2, 2),
            Obstacle::new(2, 5),
            Obstacle::new(2, 6),
            Obstacle::new(9, 1),
            Obstacle::new(9, 2),
            Obstacle::new(9, 5),
            Obstacle::new(9, 6),
            Obstacle::new(10, 2),
            Obstacle::new(10, 5),
        ];
        base_state.big_enemies = vec![BigEnemy::new(6, 1, OrientationWithDiagonals::Down, false)];
        base_state.telepads = vec![
            Telepad::new((11, 0), (0, 7), Orientation::Up),
            Telepad::new((0, 0), (11, 7), Orientation::Up),
        ];
        base_state.buttons = vec![Button::new_with_info(
            1,
            1,
            ButtonConnection::Gate(0),
            "Press this button to lock/unlock one of the gates.".into(),
        )];
        base_state.gates = vec![Gate::new_with_info(
            5,
            6,
            true,
            GateVariant::NESW,
            "This gate can be locked/unlocked by pressing the nearby button.".into(),
        )];
        base_state.data_points = vec![DataPoint::new_with_info(
            10,
            1,
            "password".into(),
            "This data point will output the password for one of the gates.".into(),
        )];
        base_state.password_gates = vec![PasswordGate::new_with_info(
            6,
            6,
            "password".into(),
            true,
            GateVariant::NWSE,
            "The password for this gate can be found in the nearby data point.".into(),
        )];
        make_all_initial_states_for_telepads(vec![base_state])
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(BigEnemyActor::new(0, Bounds::default()))]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Complete the objective in 12 or fewer steps.")
    }
    fn check_challenge(&self, _states: &Vec<State>, _script: &str, stats: &ScriptStats) -> bool {
        stats.time_taken <= 12
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::{Outcome, ERR_OUT_OF_ENERGY};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &BigEnemyLevel {};

        // Running the initial code should result in Outcome::Failure due to
        // running out of energy.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_ENERGY))
        );

        // Running this code should result in Outcome::Success.
        let script = r"
            move_forward(5);
            turn_left();
            turn_left();
            move_forward(1);
            turn_right();
            move_forward(4);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Player should not be able to move past the obstacles for this level.
        let script = r"
            move_forward(5);
            turn_left();
            move_forward(4);
            turn_left();
            move_forward(1);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &BigEnemyLevel {};

        // This code beats the level, but doesn't satisfy the challenge conditions.
        let script = r"
            move_forward(5);
            turn_left();
            turn_left();
            move_forward(1);
            turn_right();
            move_forward(4);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, false);

        // This code satisfies the challenge conditions.
        let script = r"
            move_forward(5);
            move_backward(1);
            turn_left();
            move_forward(4);";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.passes_challenge, true);
    }
}
