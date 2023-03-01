use super::{std_check_win, Level, Outcome, AVAIL_FUNCS_WITH_READ};
use crate::simulation::{Actor, DataTerminal, Obstacle, Orientation, Player, State};

/// A simple level that uses data terminals.
/// Used for recording GIFs and videos only.
#[derive(Copy, Clone)]
pub struct DataTerminalDemo {}

impl Level for DataTerminalDemo {
    fn name(&self) -> &'static str {
        "Data Terminal Demo"
    }
    fn short_name(&self) -> &'static str {
        "data_terminal_demo"
    }
    fn objective(&self) -> &'static str {
        "(Demo only)"
    }
    fn available_functions(&self) -> &'static Vec<&'static str> {
        &AVAIL_FUNCS_WITH_READ
    }
    fn initial_code(&self) -> &'static str {
        r#"move_forward(1);
let data = read_data();
say(data);
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(1, 0, 10, Orientation::Down);
        state.goal = None;
        state.obstacles = vec![
            Obstacle::new(0, 0),
            Obstacle::new(0, 2),
            Obstacle::new(0, 3),
            Obstacle::new(1, 3),
            Obstacle::new(2, 0),
            Obstacle::new(2, 1),
            Obstacle::new(2, 2),
            Obstacle::new(2, 3),
        ];
        state.data_terminals = vec![DataTerminal::new(0, 1, "bananas".to_string())];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
}
