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
use js_sys::Array;
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;
mod script_runner;
use script_runner::{ScriptResult, ScriptRunner};
mod levels;
use levels::{Outcome, LEVELS};

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

    pub fn get_level_data(&self, level_index: usize) -> LevelData {
        let level = LEVELS[level_index].as_ref();
        LevelData {
            name: level.name().to_string(),
            objective: level.objective().to_string(),
            initial_code: level.initial_code().to_string(),
            initial_state: to_js_state(&level.initial_state()),
        }
    }

    pub async fn run_player_script(
        &mut self,
        script: String,
        level_index: usize,
    ) -> Result<RunResult, JsValue> {
        // Run the script and convert the results to the corresponding JS Types.
        let result = self.run_player_script_internal(script, level_index);
        match result {
            Ok(result) => Ok(to_js_run_result(&result)),
            Err(err) => {
                let message = err.to_string();
                let col = err.position().position().unwrap_or(0);
                let line = err.position().line().unwrap_or(0);
                Err(JsValue::from(RhaiError { message, line, col }))
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

#[wasm_bindgen]
impl State {
    pub fn new() -> State {
        State {
            player: Player {
                pos: Pos { x: 0, y: 0 },
            },
            fuel: Array::new(),
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct StateWithPos {
    pub state: State,
    pub line: i32,
    pub col: i32,
}

#[wasm_bindgen]
impl StateWithPos {
    pub fn new() -> StateWithPos {
        StateWithPos {
            state: State::new(),
            line: 0,
            col: 0,
        }
    }
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

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct RunResult {
    pub states: Array,   // Array<StateWithPos>
    pub outcome: String, // "success" | "continue" | "other failure message"
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
        outcome: match result.outcome.clone() {
            Outcome::Success => String::from("success"),
            Outcome::Failure(msg) => msg,
            Outcome::Continue => String::from("continue"),
        },
    }
}

fn to_js_state(state: &simulation::State) -> State {
    let fuel_arr = Array::new_with_length(state.fuel_spots.len() as u32);
    for (i, fuel) in state.fuel_spots.iter().enumerate() {
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

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct LevelData {
    pub name: String,
    pub objective: String,
    pub initial_state: State,
    pub initial_code: String,
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
