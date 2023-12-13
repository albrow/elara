use super::{Level, Outcome};
use crate::{
    constants::ERR_OUT_OF_ENERGY,
    simulation::{Actor, DataPoint, Obstacle, Orientation, Player, State},
};

const HUMMUS_RECIPE: &str = r"{markdown}
**Ingredients**:
- 120g dried chickpeas
- 200 mL water
- 10 mL lemon oil
- 2g citric acid
- 2g ground paprika
- 1g ground black pepper

...";

#[derive(Copy, Clone)]
pub struct DataPointsPartOne {}

impl Level for DataPointsPartOne {
    fn name(&self) -> &'static str {
        "Secret Recipe"
    }
    fn short_name(&self) -> &'static str {
        "data_points_part_one"
    }
    fn objective(&self) -> &'static str {
        "Use the `say` function to find out what the data point ({dataPoint}) holds."
    }
    fn initial_code(&self) -> &'static str {
        r#"// The read_data function outputs the data from a point, but only
// if the rover is right next to it!
//
// You need to use the output from the read_data function as the
// *input* to the say function.
//
// ADD YOUR CODE BELOW

"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(0, 3, 10, Orientation::Right);
        state.obstacles = vec![
            Obstacle::new(0, 2),
            Obstacle::new(1, 2),
            Obstacle::new(2, 2),
            Obstacle::new(3, 2),
            Obstacle::new(4, 2),
            Obstacle::new(5, 2),
            Obstacle::new(6, 2),
            Obstacle::new(0, 4),
            Obstacle::new(1, 4),
            Obstacle::new(2, 4),
            Obstacle::new(3, 4),
            Obstacle::new(4, 4),
            Obstacle::new(5, 4),
            Obstacle::new(6, 4),
        ];
        state.data_points = vec![DataPoint::new_with_info(
            6,
            3,
            HUMMUS_RECIPE.into(),
            "This data point contains the secret hummus recipe as a string.".into(),
        )];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        // Note that this level uses a different check_win function. There is not
        // goal to reach. Instead you beat the level by saying the correct message.
        if state.player.energy == 0 {
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        } else if state.player.message == HUMMUS_RECIPE {
            Outcome::Success
        } else {
            Outcome::Continue
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::{Outcome, ERR_OUT_OF_ENERGY};

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &DataPointsPartOne {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue,);

        // Running this code should result in Outcome::Success.
        let script = r"
            move_forward(5);
            say(read_data());";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Saying something else should result in Outcome::Continue.
        let script = r#"
            move_forward(5);
            say("This isn't the right message");
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // This code should cause the rover to run out of energy before saying the
        // message. (This test is a helpful sanity check since we are using a special
        // check_win function).
        let script = r#"
            move_forward(11);
            say(read_data());
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_ENERGY))
        );
    }
}
