use js_sys::Array;
use wasm_bindgen::prelude::*;

use crate::levels::Outcome;
use crate::script_runner;
use crate::simulation;

#[wasm_bindgen(getter_with_clone)]
pub struct RhaiError {
    pub message: String,
    pub line: usize,
    pub col: usize,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct State {
    pub player: Player,
    pub fuel_spots: Array, // Array<FuelSpot>
    pub goal: Goal,
    pub obstacles: Array, // Array<Obstacle>
}

#[wasm_bindgen]
impl State {
    pub fn new() -> State {
        State {
            player: Player {
                pos: Pos { x: 0, y: 0 },
                fuel: 0,
            },
            fuel_spots: Array::new(),
            goal: Goal {
                pos: Pos { x: 1, y: 1 },
            },
            obstacles: Array::new(),
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct StateWithLine {
    pub state: State,
    pub line_pos: LinePos,
}

#[wasm_bindgen]
#[derive(Clone, PartialEq, Debug)]
pub struct LinePos {
    pub line: i32,
    pub col: i32,
}

#[wasm_bindgen]
impl StateWithLine {
    pub fn new() -> StateWithLine {
        StateWithLine {
            state: State::new(),
            line_pos: LinePos { line: 0, col: 0 },
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Player {
    pub pos: Pos,
    pub fuel: i32,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Goal {
    pub pos: Pos,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct FuelSpot {
    pub pos: Pos,
    pub collected: bool,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Obstacle {
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
pub fn to_js_run_result(result: &script_runner::ScriptResult) -> RunResult {
    let arr = Array::new_with_length(result.states.len() as u32);
    for (i, (state, pos)) in result
        .states
        .iter()
        .zip(result.positions.iter())
        .enumerate()
    {
        arr.set(
            i as u32,
            JsValue::from(StateWithLine {
                state: to_js_state(state),
                line_pos: LinePos {
                    line: pos.line().unwrap_or(0) as i32,
                    col: pos.position().unwrap_or(0) as i32,
                },
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

pub fn to_js_state(state: &simulation::State) -> State {
    let fuel_arr = Array::new_with_length(state.fuel_spots.len() as u32);
    for (i, fuel_spot) in state.fuel_spots.iter().enumerate() {
        fuel_arr.set(
            i as u32,
            JsValue::from(FuelSpot {
                pos: Pos {
                    x: fuel_spot.pos.x as i32,
                    y: fuel_spot.pos.y as i32,
                },
                collected: fuel_spot.collected,
            }),
        );
    }

    let obstacle_arr = Array::new_with_length(state.obstacles.len() as u32);
    for (i, obstacle) in state.obstacles.iter().enumerate() {
        obstacle_arr.set(
            i as u32,
            JsValue::from(Obstacle {
                pos: Pos {
                    x: obstacle.pos.x as i32,
                    y: obstacle.pos.y as i32,
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
            fuel: state.player.fuel as i32,
        },
        fuel_spots: fuel_arr,
        goal: Goal {
            pos: Pos {
                x: state.goal.pos.x as i32,
                y: state.goal.pos.y as i32,
            },
        },
        obstacles: obstacle_arr,
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
