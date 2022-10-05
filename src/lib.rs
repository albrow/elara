extern crate console_error_panic_hook;

#[macro_use]
mod log;

#[macro_use]
extern crate lazy_static;

use wasm_bindgen::prelude::*;
mod simulation;
use simulation::Simulation;
mod actors;
use actors::{Action, Bounds};
use js_sys::Array;
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;
mod script_runner;
use script_runner::ScriptRunner;
mod levels;
use levels::{Outcome, LEVELS};

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
    level_index: usize,
    player_action_rx: &'static mpsc::Receiver<Action>,
    player_action_tx: &'static mpsc::Sender<Action>,
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

        let player_action_rx = unsafe { PLAYER_ACTION_RX.as_ref().unwrap() };
        let player_action_tx = unsafe { PLAYER_ACTION_TX.as_ref().unwrap() };

        // Set up the player actor and add it to the Simulation.
        let bounds = Bounds {
            max_x: width,
            max_y: height,
        };
        let player_actor = actors::PlayerChannelActor::new(player_action_rx, bounds);

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
        let script_runner = ScriptRunner::new(simulation.clone(), player_action_tx);

        Game {
            simulation: simulation,
            script_runner,
            level_index,
            player_action_rx,
            player_action_tx,
        }
    }

    pub fn initial_state(&self) -> State {
        to_js_state(&LEVELS[self.level_index].initial_state())
    }

    pub fn initial_code(&self) -> String {
        LEVELS[self.level_index].initial_code().to_string()
    }

    pub fn curr_level_objective(&self) -> String {
        LEVELS[self.level_index].objective().to_string()
    }

    pub fn reset(&mut self) {
        self.simulation.borrow_mut().reset();
        // Drain the channel.
        while let Ok(_) = self.player_action_rx.try_recv() {}
    }

    pub async fn run_player_script(&mut self, script: String) -> Result<RunResult, JsValue> {
        // Run the script and return an array of states.
        let result = self.script_runner.run(script);
        match result {
            Ok(result) => {
                match result.outcome {
                    Outcome::Success => {}
                    Outcome::Failure => {}
                    Outcome::Continue => {}
                }
                Ok(to_js_run_result(&result))
            }
            Err(err) => {
                let message = err.to_string();
                let col = err.position().position().unwrap_or(0);
                let line = err.position().line().unwrap_or(0);
                Err(JsValue::from(RhaiError { message, line, col }))
            }
        }
    }
}

#[wasm_bindgen]
pub struct RhaiError {
    message: String,
    line: usize,
    col: usize,
}

#[wasm_bindgen]
impl RhaiError {
    #[wasm_bindgen(getter)]
    pub fn message(&self) -> String {
        self.message.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn line(&self) -> usize {
        self.line
    }

    #[wasm_bindgen(getter)]
    pub fn col(&self) -> usize {
        self.col
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct State {
    pub player: Player,
    pub fuel: Array, // Array<Fuel>
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct RunResult {
    pub states: Array,   // Array<StateWithPos>
    pub outcome: String, // "success" | "failure" | "continue"
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct StateWithPos {
    pub state: State,
    pub line: i32,
    pub col: i32,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Player {
    pub pos: Pos,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Fuel {
    pub pos: Pos,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Pos {
    pub x: i32,
    pub y: i32,
}

/// Converts script_runner::ScriptResult to a format that is wasm_bindgen
/// compatible and can ultimately be used by the JavaScript code.
fn to_js_run_result(result: &script_runner::ScriptResult) -> RunResult {
    let arr = Array::new_with_length(result.states.len() as u32);
    for (i, (state, pos)) in result
        .states
        .iter()
        .zip(result.positions.iter())
        .enumerate()
    {
        arr.set(
            i as u32,
            JsValue::from(StateWithPos {
                state: to_js_state(state),
                line: pos.line().unwrap_or(0) as i32,
                col: pos.position().unwrap_or(0) as i32,
            }),
        );
    }
    RunResult {
        states: arr,
        outcome: match result.outcome {
            Outcome::Success => "success",
            Outcome::Failure => "failure",
            Outcome::Continue => "continue",
        }
        .to_string(),
    }
}

fn to_js_state(state: &simulation::State) -> State {
    let fuel_arr = Array::new_with_length(state.fuel.len() as u32);
    for (i, fuel) in state.fuel.iter().enumerate() {
        fuel_arr.set(
            i as u32,
            JsValue::from(Fuel {
                pos: Pos {
                    x: fuel.pos.x as i32,
                    y: fuel.pos.y as i32,
                },
            }),
        );
    }
    State {
        player: Player {
            pos: Pos {
                x: state.player.pos.x as i32,
                y: state.player.pos.y as i32,
            },
        },
        fuel: fuel_arr,
    }
}
