extern crate console_error_panic_hook;

#[macro_use]
mod log;

#[macro_use]
extern crate lazy_static;

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
use levels::LEVELS;
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
            max_x: WIDTH,
            max_y: HEIGHT,
        };
        let player_actor = actors::PlayerChannelActor::new(player_action_rx.clone(), bounds);

        // Simulation must be wrapped in Rc<RefCell> in order to be
        // used in the script_runner. This is due to a constraint
        // imposed by the Rhai Engine for registered functions.
        let level_index = 0;
        let simulation = Rc::new(RefCell::new(Simulation::new(
            LEVELS[level_index].as_ref(),
            Box::new(player_actor),
        )));

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
            initial_state: js_types::to_js_state(&level.initial_state()),
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
        // Reset the simulation and load the level.
        self.level_index = level_index;
        self.simulation
            .borrow_mut()
            .load_level(LEVELS[level_index].as_ref());
        // Drain the channel.
        while let Ok(_) = self.player_action_rx.clone().borrow().try_recv() {}
        // Run the script.
        return self.script_runner.run(script);
    }
}

#[cfg(test)]
mod tests {
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
        let script = "for x in 0..25 {move_right(1); move_left(1);}\nmove_right(3); move_down(3);";
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
    }
}
