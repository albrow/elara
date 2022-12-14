use super::{std_check_win, Level, Outcome};
use crate::actors::{Bounds, EnemyBugActor};
use crate::constants::{HEIGHT, WIDTH};
use crate::simulation::{Actor, Enemy, FuelSpot, Goal, Obstacle, Player, Pos, State};

#[derive(Copy, Clone)]
pub struct EnemiesPartOne {}

impl Level for EnemiesPartOne {
    fn name(&self) -> &'static str {
        "What's that Buzzing Sound?"
    }
    fn short_name(&self) -> &'static str {
        "enemies_part_one"
    }
    fn objective(&self) -> &'static str {
        "Move the rover ({robot}) to the goal ({goal}), but watch out for bugs ({bug})!"
    }
    fn initial_code(&self) -> &'static str {
        r"// If you try going straight for the goal, you might run
// into trouble. Can you find a different path?

move_left(2);
move_down(5);
"
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(11, 0, 8);
        state.fuel_spots = vec![
            FuelSpot {
                pos: Pos { x: 4, y: 1 },
                collected: false,
            },
            FuelSpot {
                pos: Pos { x: 0, y: 5 },
                collected: false,
            },
        ];
        state.goal = Some(Goal {
            pos: Pos { x: 9, y: 5 },
        });
        state.enemies = vec![Enemy {
            pos: Pos { x: 9, y: 7 },
        }];
        state.obstacles = vec![
            Obstacle::new(8, 1),
            Obstacle::new(8, 2),
            Obstacle::new(8, 3),
            Obstacle::new(8, 4),
            Obstacle::new(7, 4),
            Obstacle::new(6, 4),
            Obstacle::new(8, 6),
            Obstacle::new(7, 6),
            Obstacle::new(6, 6),
            Obstacle::new(4, 6),
            Obstacle::new(3, 6),
            Obstacle::new(7, 1),
            Obstacle::new(6, 1),
            Obstacle::new(5, 1),
            Obstacle::new(4, 2),
            Obstacle::new(3, 1),
            Obstacle::new(2, 1),
            Obstacle::new(5, 4),
            Obstacle::new(4, 4),
            Obstacle::new(1, 1),
            Obstacle::new(1, 2),
            Obstacle::new(1, 3),
            Obstacle::new(1, 4),
            Obstacle::new(1, 6),
            Obstacle::new(1, 7),
            Obstacle::new(10, 1),
            Obstacle::new(10, 2),
            Obstacle::new(10, 3),
            Obstacle::new(10, 4),
            Obstacle::new(10, 5),
            Obstacle::new(10, 6),
            Obstacle::new(2, 4),
            Obstacle::new(3, 4),
            Obstacle::new(2, 6),
            Obstacle::new(5, 6),
            Obstacle::new(11, 1),
            Obstacle::new(3, 2),
            Obstacle::new(5, 2),
            Obstacle::new(8, 7),
            Obstacle::new(10, 7),
        ];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![Box::new(EnemyBugActor::new(
            0,
            Bounds {
                max_x: WIDTH - 1,
                max_y: HEIGHT - 1,
            },
        ))]
    }
    fn check_win(&self, state: &State) -> Outcome {
        std_check_win(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::{ERR_DESTROYED_BY_BUG, ERR_OUT_OF_FUEL};
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &EnemiesPartOne {};

        // Running the initial code should result in Outcome::Failure due to
        // being destroyed by a bug.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_DESTROYED_BY_BUG))
        );

        // Running this code should result in Outcome::Success.
        let script = r"move_left(7);
            move_down(1);
            move_up(1);
            move_left(4);
            move_down(5);
            move_right(9);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Forgetting to collect the first fuel spot should result in ERR_OUT_OF_FUEL.
        let script = r"move_left(11);
            move_down(5);
            move_right(9);";
        let result = game
            .run_player_script_internal(script.to_string(), LEVEL)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
    }
}
