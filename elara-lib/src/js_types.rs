use js_sys::Array;
use wasm_bindgen::prelude::*;

use crate::levels;
use crate::levels::Outcome;
use crate::script_runner;

#[wasm_bindgen(getter_with_clone)]
pub struct RhaiError {
    pub message: String,
    pub line: usize,
    pub col: usize,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct FuzzyStateWithLine {
    pub state: FuzzyState,
    pub line_pos: LinePos,
}

#[wasm_bindgen]
#[derive(Clone, PartialEq, Debug)]
pub struct LinePos {
    pub line: i32,
    pub col: i32,
}

#[wasm_bindgen]
impl FuzzyStateWithLine {
    pub fn new() -> FuzzyStateWithLine {
        FuzzyStateWithLine {
            state: FuzzyState::new(),
            line_pos: LinePos { line: 0, col: 0 },
        }
    }
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
            JsValue::from(FuzzyStateWithLine {
                state: FuzzyState::from(levels::FuzzyState::from_single_state(state)),
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

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct LevelData {
    pub name: String,
    pub objective: String,
    pub initial_state: FuzzyState,
    pub initial_code: String,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct FuzzyState {
    pub players: Array,    // Array<FuzzyPlayer>
    pub fuel_spots: Array, // Array<FuzzyFuelSpot>
    pub goals: Array,      // Array<FuzzyGoal>
    pub enemies: Array,    // Array<FuzzyEnemy>
    pub obstacles: Array,  // Array<FuzzyObstacle>
}

impl FuzzyState {
    pub fn new() -> Self {
        FuzzyState {
            players: Array::new(),
            fuel_spots: Array::new(),
            goals: Array::new(),
            enemies: Array::new(),
            obstacles: Array::new(),
        }
    }

    pub fn from(state: levels::FuzzyState) -> Self {
        let players = Array::new_with_length(state.players.len() as u32);
        for (i, fuzzy_player) in state.players.iter().enumerate() {
            let player = &fuzzy_player.obj;
            players.set(
                i as u32,
                JsValue::from(FuzzyPlayer {
                    pos: Pos {
                        x: player.pos.x as i32,
                        y: player.pos.y as i32,
                    },
                    fuel: player.fuel as i32,
                    fuzzy: fuzzy_player.fuzzy,
                }),
            );
        }

        let fuel_spots = Array::new_with_length(state.fuel_spots.len() as u32);
        for (i, fuzzy_fuel_spot) in state.fuel_spots.iter().enumerate() {
            let fuel_spot = &fuzzy_fuel_spot.obj;
            fuel_spots.set(
                i as u32,
                JsValue::from(FuzzyFuelSpot {
                    pos: Pos {
                        x: fuel_spot.pos.x as i32,
                        y: fuel_spot.pos.y as i32,
                    },
                    collected: fuel_spot.collected,
                    fuzzy: fuzzy_fuel_spot.fuzzy,
                }),
            );
        }

        let goals = Array::new_with_length(state.goals.len() as u32);
        for (i, fuzzy_goal) in state.goals.iter().enumerate() {
            let goal = &fuzzy_goal.obj;
            goals.set(
                i as u32,
                JsValue::from(FuzzyGoal {
                    pos: Pos {
                        x: goal.pos.x as i32,
                        y: goal.pos.y as i32,
                    },
                    fuzzy: fuzzy_goal.fuzzy,
                }),
            );
        }

        let enemies = Array::new_with_length(state.enemies.len() as u32);
        for (i, fuzzy_enemy) in state.enemies.iter().enumerate() {
            let enemy = &fuzzy_enemy.obj;
            enemies.set(
                i as u32,
                JsValue::from(FuzzyEnemy {
                    pos: Pos {
                        x: enemy.pos.x as i32,
                        y: enemy.pos.y as i32,
                    },
                    fuzzy: fuzzy_enemy.fuzzy,
                }),
            );
        }

        let obstacles = Array::new_with_length(state.obstacles.len() as u32);
        for (i, fuzzy_obstacle) in state.obstacles.iter().enumerate() {
            let obstacle = &fuzzy_obstacle.obj;
            obstacles.set(
                i as u32,
                JsValue::from(FuzzyObstacle {
                    pos: Pos {
                        x: obstacle.pos.x as i32,
                        y: obstacle.pos.y as i32,
                    },
                    fuzzy: fuzzy_obstacle.fuzzy,
                }),
            );
        }

        FuzzyState {
            players,
            fuel_spots,
            goals,
            enemies,
            obstacles,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct FuzzyPlayer {
    pub pos: Pos,
    pub fuel: i32,
    fuzzy: bool,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct FuzzyGoal {
    pub pos: Pos,
    fuzzy: bool,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct FuzzyFuelSpot {
    pub pos: Pos,
    pub collected: bool,
    fuzzy: bool,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct FuzzyEnemy {
    pub pos: Pos,
    fuzzy: bool,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct FuzzyObstacle {
    pub pos: Pos,
    fuzzy: bool,
}
