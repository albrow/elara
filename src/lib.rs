extern crate console_error_panic_hook;

#[macro_use]
mod log;

use wasm_bindgen::prelude::*;
mod simulation;
use simulation::{Simulation, State};
mod actors;
use actors::{Action, Bounds};
use js_sys::Array;
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;
mod script_runner;
use script_runner::ScriptRunner;

// Note(albrow): These channels will be used to communicate between the
// Rhai script and the Rust code, particularly the Simulation. They are
// ultimately used in a function which is registered with the Rhai Engine via
// register_function, which requires a static lifetime.
static mut PLAYER_ACTION_TX: Option<mpsc::Sender<Action>> = None;
static mut PLAYER_ACTION_RX: Option<mpsc::Receiver<Action>> = None;

#[wasm_bindgen]
/// Game is the main entry point for the game. It is responsible for
/// managing state, running user scripts, and gluing all the pieces
/// together.
pub struct Game {
    simulation: Rc<RefCell<Simulation>>,
    script_runner: ScriptRunner,
}

#[wasm_bindgen]
impl Game {
    pub fn new(width: u32, height: u32) -> Game {
        console_error_panic_hook::set_once();

        // Initialize static channels. Note that unsafe code should
        // be isolated to this function. Any other part of the code
        // that needs to access the channels can do so by accessing
        // the properties of the Game.
        unsafe {
            let (player_tx, player_rx) = mpsc::channel();
            PLAYER_ACTION_TX = Some(player_tx);
            PLAYER_ACTION_RX = Some(player_rx);
        }

        // Simulation must be wrapped in Rc<RefCell> in order to be
        // used in the script_runner. This is due to a constraint
        // imposed by the Rhai Engine for registered functions.
        let simulation = Rc::new(RefCell::new(Simulation::new()));

        // Set up the player actor and add it to the Simulation.
        let bounds = Bounds {
            max_x: width,
            max_y: height,
        };
        let actor =
            actors::PlayerChannelActor::new(unsafe { PLAYER_ACTION_RX.as_ref().unwrap() }, bounds);
        simulation.borrow_mut().add_actor(Box::new(actor));

        // Set up the script runner, which holds references to the
        // player_tx channel and the simulation and glues them together.
        let script_runner = ScriptRunner::new(simulation.clone(), unsafe {
            PLAYER_ACTION_TX.as_ref().unwrap()
        });

        Game {
            simulation: simulation,
            script_runner,
        }
    }

    pub fn get_state(&self) -> State {
        self.simulation.borrow().curr_state()
    }

    pub fn reset(&mut self) {
        self.simulation.borrow_mut().reset();
    }

    pub async fn run_player_script(&mut self, script: String) -> Result<Array, JsValue> {
        // Run the script and return an array of states.
        // TODO(albrow): Handle errors.
        let results = self.script_runner.run(script).unwrap();
        let states: Array = results.into_iter().map(JsValue::from).collect();
        Ok(states)
    }
}
