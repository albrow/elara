extern crate console_error_panic_hook;

#[macro_use]
mod log;

#[macro_use]
extern crate lazy_static;

mod actors;
mod better_errors;
mod constants;
mod js_types;
mod levels;
mod script_runner;
mod simulation;
mod state_maker;

use actors::{Action, Bounds};
use better_errors::BetterError;
use constants::{HEIGHT, WIDTH};
use levels::{Level, Outcome, LEVELS};
use rand::seq::SliceRandom;
use script_runner::{ScriptResult, ScriptRunner};
use simulation::Simulation;
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
/// Game is the main entry point for the game. It is responsible for
/// managing state, running user scripts, and gluing all the pieces
/// together.
pub struct Game {
    simulation: Rc<RefCell<Simulation>>,
    script_runner: ScriptRunner,
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
            min_x: 0,
            max_x: (WIDTH - 1) as i32,
            min_y: 0,
            max_y: (HEIGHT - 1) as i32,
        };
        let player_actor = actors::PlayerChannelActor::new(player_action_rx.clone(), bounds);

        // Simulation must be wrapped in Rc<RefCell> in order to be
        // used in the script_runner. This is due to a constraint
        // imposed by the Rhai Engine for registered functions.
        let simulation = Rc::new(RefCell::new(Simulation::new(player_actor)));

        // Set up the script runner, which holds references to the
        // player_tx channel and the simulation and glues them together.
        let script_runner = ScriptRunner::new(simulation.clone(), player_action_tx.clone());

        Game {
            simulation,
            script_runner,
            player_action_rx,
            // player_action_tx,
        }
    }

    pub fn run_player_script(
        &mut self,
        script: String,
        level_name: &str,
    ) -> Result<js_types::RunResult, JsValue> {
        // Run the script and convert the results to the corresponding JS Types.
        let level = LEVELS.get(level_name).unwrap();
        let result = self.run_player_script_internal(script, level.as_ref());
        match result {
            Ok(result) => Ok(js_types::to_js_run_result(&result)),
            Err(err) => {
                let message = err.message;
                let line = err.line.unwrap_or(0);
                let col = err.col.unwrap_or(0);
                Err(JsValue::from(js_types::RhaiError { message, line, col }))
            }
        }
    }
}

impl Game {
    fn run_player_script_internal(
        &mut self,
        script: String,
        level: &'static dyn Level,
    ) -> Result<ScriptResult, BetterError> {
        // Run the simulation multiple times, once for each possible initial
        // state. Return the first result that fails (if any), otherwise return
        // a random successful result.
        let mut successes: Vec<ScriptResult> = vec![];

        // Shuffle the seeds to keep up the illusion that the game behavior is
        // random.
        let mut seeds: Vec<usize> = (0..(level.initial_states().len())).collect();
        let mut rng = rand::thread_rng();
        seeds.shuffle(&mut rng);

        for i in seeds {
            // Reset the simulation and load the level.
            self.simulation.borrow_mut().load_level(level, i);
            // Drain the channel.
            while let Ok(_) = self.player_action_rx.clone().borrow().try_recv() {}
            // Run the script.
            let result = self
                .script_runner
                .run(level.available_functions(), script.as_str())?;
            match result.outcome {
                Outcome::Success => {
                    successes.push(result);
                }
                // Return the first failure.
                _ => return Ok(result),
            }
        }

        // If we've reached here, it means the main objective for the level was met.
        // Now we need to check for the optional challenge. If there is a challenge
        // for this level, return the first result which did not pass the challenge
        // (if any).
        if level.challenge().is_some() {
            for result in successes.iter() {
                if !result.passes_challenge {
                    return Ok(result.clone());
                }
            }
        }

        // Otherwise, return the first successful result. (This is effectively
        // a random result since the seeds were shuffled above.)
        Ok(successes.first().unwrap().clone())
    }
}

#[wasm_bindgen]
/// Returns the length of the compacted code (i.e. not counting comments
/// or whitespace).
pub fn get_compact_code_len(script: &str) -> Option<usize> {
    let compacted = rhai::Engine::new().compact_script(script);
    match compacted {
        Ok(compacted) => Some(compacted.len()),
        Err(_) => None,
    }
}

#[wasm_bindgen]
pub fn get_level_data() -> js_sys::Object {
    js_types::to_level_data_obj(LEVELS.clone())
}

#[wasm_bindgen]
pub fn new_pos() -> js_types::Pos {
    js_types::Pos { x: 0, y: 0 }
}

#[wasm_bindgen]
pub fn new_state() -> js_types::FuzzyState {
    js_types::FuzzyState::new()
}
