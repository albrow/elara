extern crate console_error_panic_hook;

#[macro_use]
mod log;

#[macro_use]
extern crate lazy_static;

use rand::seq::SliceRandom;
use rhai::EvalAltResult;
use wasm_bindgen::prelude::*;
mod simulation;
use simulation::Simulation;
mod actors;
use actors::{Action, Bounds};
mod constants;
use constants::{HEIGHT, WIDTH};
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;
mod script_runner;
use script_runner::{ScriptResult, ScriptRunner};
mod levels;
use levels::{Outcome, LEVELS};
mod js_types;

#[wasm_bindgen]
/// Game is the main entry point for the game. It is responsible for
/// managing state, running user scripts, and gluing all the pieces
/// together.
pub struct Game {
    simulation: Rc<RefCell<Simulation>>,
    script_runner: ScriptRunner,
    level_index: usize,
    player_action_rx: Rc<RefCell<mpsc::Receiver<Action>>>,
    // player_action_tx: Rc<RefCell<mpsc::Sender<Action>>>,
}

#[wasm_bindgen]
impl Game {
    pub fn new() -> Game {
        console_error_panic_hook::set_once();

        // Note(albrow): Below we will establish a few Rcs which are a critical
        // part of the game (e.g. simulation and player_action_tx). They are
        // ultimately used with the Rhai engine via register_fn or
        // register_debugger. Normally Rhai only allows static lifetimes in this
        // context, but we can workaround that by using Rc<RefCell<>>. See
        // https://rhai.rs/book/patterns/control.html for more context.
        let (tx, rx) = mpsc::channel();
        let player_action_tx = Rc::new(RefCell::new(tx));
        let player_action_rx = Rc::new(RefCell::new(rx));

        // Set up the player actor and add it to the Simulation.
        let bounds = Bounds {
            max_x: WIDTH - 1,
            max_y: HEIGHT - 1,
        };
        let player_actor = actors::PlayerChannelActor::new(player_action_rx.clone(), bounds);

        // Simulation must be wrapped in Rc<RefCell> in order to be
        // used in the script_runner. This is due to a constraint
        // imposed by the Rhai Engine for registered functions.
        let level_index = 0;
        let simulation = Rc::new(RefCell::new(Simulation::new(Box::new(player_actor))));

        // Set up the script runner, which holds references to the
        // player_tx channel and the simulation and glues them together.
        let script_runner = ScriptRunner::new(simulation.clone(), player_action_tx.clone());

        Game {
            simulation,
            script_runner,
            level_index,
            player_action_rx,
            // player_action_tx,
        }
    }

    pub fn get_level_data(&self, level_index: usize) -> js_types::LevelData {
        let level = LEVELS[level_index].as_ref();
        js_types::LevelData {
            name: level.name().to_string(),
            objective: level.objective().to_string(),
            initial_code: level.initial_code().to_string(),
            initial_state: js_types::FuzzyState::from(level.initial_fuzzy_state()),
        }
    }

    pub async fn run_player_script(
        &mut self,
        script: String,
        level_index: usize,
    ) -> Result<js_types::RunResult, JsValue> {
        // Run the script and convert the results to the corresponding JS Types.
        let result = self.run_player_script_internal(script, level_index);
        match result {
            Ok(result) => Ok(js_types::to_js_run_result(&result)),
            Err(err) => {
                let message = err.to_string();
                let col = err.position().position().unwrap_or(0);
                let line = err.position().line().unwrap_or(0);
                Err(JsValue::from(js_types::RhaiError { message, line, col }))
            }
        }
    }
}

impl Game {
    fn run_player_script_internal(
        &mut self,
        script: String,
        level_index: usize,
    ) -> Result<ScriptResult, Box<EvalAltResult>> {
        // Run the simulation multiple times, once for each possible initial
        // state. Return the first result that fails (if any), otherwise return
        // a random successful result.
        let level = LEVELS[level_index].as_ref();
        let mut last_success: Option<ScriptResult> = None;

        // Shuffle the seeds to keep up the illusion that the game behaviour is
        // random.
        let mut seeds: Vec<usize> = (0..(level.initial_states().len())).collect();
        let mut rng = rand::thread_rng();
        seeds.shuffle(&mut rng);

        for i in seeds {
            // Reset the simulation and load the level.
            self.level_index = level_index;
            self.simulation
                .borrow_mut()
                .load_level(LEVELS[level_index].as_ref(), i);
            // Drain the channel.
            while let Ok(_) = self.player_action_rx.clone().borrow().try_recv() {}
            // Run the script.
            let result = self.script_runner.run(script.as_str())?;
            match result.outcome {
                Outcome::Success => {
                    last_success = Some(result);
                }
                // Return the first failure.
                _ => return Ok(result),
            }
        }
        Ok(last_success.unwrap())
    }
}

#[cfg(test)]
mod tests {
    use crate::constants::ERR_DESTROYED_BY_BUG;
    use crate::constants::ERR_OUT_OF_FUEL;
    use crate::levels::Outcome;
    use crate::levels::LEVELS;

    #[test]
    fn level_one() {
        let mut game = crate::Game::new();
        let level_index = 0;

        // Running the initial code should result in Outcome::Continue.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = "move_right(3); move_down(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.states.len(), 7);

        // Running this code should result in Outcome::Failure due to running out
        // of fuel.
        let script = r"for x in 0..25 {
                move_right(1);
                move_left(1);
            }
            move_right(3);
            move_down(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );

        // Player should not be able to move past the obstacles for this level.
        // First try moving too far right. This should still be a success because
        // the player should stop moving right after hitting the obstacle at (4, 0).
        let script = "move_right(5); move_down(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Now try moving too far down.
        let script = "move_down(5); move_right(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // It is *okay* for a script to contain an infinite loop, as long as we either
        // run out of fuel or reach the objective before hitting the limitation for max
        // operations in the Rhai engine.
        // In this case, we reach the objective first, so we expect Outcome::Success.
        let script = r"move_right(3);
            move_down(3);
            while (true) {
                move_up(1);
                move_down(1);
            }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        // In this case, we don't reach the objective so we expect ERR_OUT_OF_FUEL.
        let script = r"while (true) {
                move_up(1);
                move_down(1);
            }
            move_right(3);
            move_down(3);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
    }

    #[test]
    fn level_two() {
        let mut game = crate::Game::new();
        let level_index = 1;

        // Running the initial code should result in Outcome::Failure due to
        // running out of fuel.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );

        // Running this code should result in Outcome::Success.
        let script = "move_down(5); move_up(1); move_right(4);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert_eq!(result.states.len(), 11);

        // Player should not be able to move past the obstacles for this level.
        let script = "move_down(5); move_right(4); move_up(1);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }

    #[test]
    fn level_three() {
        let mut game = crate::Game::new();
        let level_index = 2;

        // Running the initial code should result in Outcome::Failure due to
        // running out of fuel.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );

        // Running this code should result in Outcome::Success.
        let script = r"loop {
            move_right(1);
            move_up(1);
        }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn level_four() {
        let mut game = crate::Game::new();
        let level_index = 3;

        // Running the initial code should result in Outcome::Failure due to
        // being destroyed by a bug.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
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
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Forgetting to collect the first fuel spot should result in ERR_OUT_OF_FUEL.
        let script = r"move_left(11);
            move_down(5);
            move_right(9);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
    }

    #[test]
    fn level_five() {
        let mut game = crate::Game::new();
        let level_index = 4;

        // Running the initial code should result in Outcome::Failure due to
        // being destroyed by a bug.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success because we
        // are accounting for both possible positions.
        let script = r"let pos = get_pos();
            if pos[0] == 0 {
                move_right(5);
            } else if pos[0] == 10 {
                move_left(5);
            }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Hard-coding the movement direction should always result in failure.
        let script = "move_right(5);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
        let script = "move_left(5);";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );

        // Only accounting for one branch of the if statement should
        // result in failure, this time Outcome::Continue.
        let script = r"let pos = get_pos();
            if pos[0] == 0 {
                move_right(5);
            } else if pos[0] == 10 {
                // Do nothing.
            }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
        let script = r"let pos = get_pos();
            if pos[0] == 0 {
                // Do nothing.
            } else if pos[0] == 10 {
                move_left(5);
            }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);
    }

    #[test]
    fn level_six() {
        let mut game = crate::Game::new();
        let level_index = 5;

        // Running the initial code should result in Outcome::Failure due to
        // being destroyed by a bug.
        let script = LEVELS[level_index].initial_code();
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success because we
        // are accounting for both possible positions.
        let script = r#"let goal = [6, 3];
            while true {
                let pos = get_pos();
                if pos[0] < goal[0] {
                    move_right(1);
                } else if pos[0] > goal[0] {
                    move_left(1);
                } else if pos[1] < goal[1] {
                    move_down(1);
                } else if pos[1] > goal[1] {
                    move_up(1);
                }
            }"#;
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);

        // Hard-coding the movement direction should always result in failure.
        let script = r"while true {
            move_right(1);
            move_up(1);
        }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
        let script = r"while true {
            move_left(1);
            move_down(1);
        }";
        let result = game
            .run_player_script_internal(script.to_string(), level_index)
            .unwrap();
        assert_eq!(
            result.outcome,
            Outcome::Failure(String::from(ERR_OUT_OF_FUEL))
        );
    }
}
