use super::{std_check_win, Level, Outcome};
use crate::simulation::{Actor, DataPoint, Obstacle, Orientation, Player, State};

/// A simple level that uses data points.
/// Used for recording GIFs and videos only.
#[derive(Copy, Clone)]
pub struct DataPointDemo {}

impl Level for DataPointDemo {
    fn name(&self) -> &'static str {
        "Data Point Demo"
    }
    fn short_name(&self) -> &'static str {
        "data_point_demo"
    }
    fn objective(&self) -> &'static str {
        "(Demo only)"
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
        state.data_points = vec![DataPoint::new(0, 1, "bananas".into())];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
}
