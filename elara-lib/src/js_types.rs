use js_sys::{Array, Object};
use wasm_bindgen::prelude::*;

use crate::levels;
use crate::levels::Outcome;
use crate::script_runner;
use crate::simulation::{Direction, EnemyAnimState, PlayerAnimState};

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
            Outcome::NoObjective => String::from("no_objective"),
        },
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct LevelData {
    pub name: String,
    pub short_name: String,
    pub objective: String,
    pub initial_state: FuzzyState,
    pub initial_code: String,
}

impl LevelData {
    pub fn from(level: &dyn levels::Level) -> Self {
        Self {
            name: level.name().to_string(),
            short_name: level.short_name().to_string(),
            objective: level.objective().to_string(),
            initial_code: level.initial_code().to_string(),
            initial_state: FuzzyState::from(level.initial_fuzzy_state()),
        }
    }
}

pub fn to_level_data_obj(levels: levels::LEVELS) -> Object {
    let obj = Object::new();
    for (name, level) in levels.iter() {
        #[allow(unused_unsafe)]
        unsafe {
            js_sys::Reflect::set(
                &obj,
                &JsValue::from(name.to_string()),
                &JsValue::from(LevelData::from(level.as_ref())),
            )
            .unwrap();
        }
    }
    obj
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct FuzzyState {
    pub players: Array,        // Array<FuzzyPlayer>
    pub fuel_spots: Array,     // Array<FuzzyFuelSpot>
    pub goals: Array,          // Array<FuzzyGoal>
    pub enemies: Array,        // Array<FuzzyEnemy>
    pub obstacles: Array,      // Array<FuzzyObstacle>
    pub password_gates: Array, // Array<FuzzyPasswordGate>
    pub data_terminals: Array, // Array<FuzzyDataTerminal>
}

impl FuzzyState {
    pub fn new() -> Self {
        FuzzyState {
            players: Array::new(),
            fuel_spots: Array::new(),
            goals: Array::new(),
            enemies: Array::new(),
            obstacles: Array::new(),
            password_gates: Array::new(),
            data_terminals: Array::new(),
        }
    }

    pub fn from(state: levels::FuzzyState) -> Self {
        let players = Array::new_with_length(state.players.len() as u32);
        for (i, fuzzy_player) in state.players.iter().enumerate() {
            let anim_state = match fuzzy_player.obj.anim_state {
                PlayerAnimState::Idle => "idle",
                PlayerAnimState::Moving => "moving",
                PlayerAnimState::Turning => "turning",
            };
            let facing = match fuzzy_player.obj.facing {
                Direction::Up => "up",
                Direction::Down => "down",
                Direction::Left => "left",
                Direction::Right => "right",
            };
            let player = &fuzzy_player.obj;
            players.set(
                i as u32,
                JsValue::from(FuzzyPlayer {
                    pos: Pos {
                        x: player.pos.x as i32,
                        y: player.pos.y as i32,
                    },
                    fuel: player.fuel as i32,
                    message: player.message.clone(),
                    anim_state: anim_state.to_string(),
                    facing: facing.to_string(),
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
            let anim_state = match enemy.anim_state {
                EnemyAnimState::Idle => "idle",
                EnemyAnimState::Moving => "moving",
            };
            enemies.set(
                i as u32,
                JsValue::from(FuzzyEnemy {
                    pos: Pos {
                        x: enemy.pos.x as i32,
                        y: enemy.pos.y as i32,
                    },
                    anim_state: anim_state.to_string(),
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

        let password_gates = Array::new_with_length(state.password_gates.len() as u32);
        for (i, fuzzy_password_gate) in state.password_gates.iter().enumerate() {
            let password_gate = &fuzzy_password_gate.obj;
            password_gates.set(
                i as u32,
                JsValue::from(FuzzyPasswordGate {
                    pos: Pos {
                        x: password_gate.pos.x as i32,
                        y: password_gate.pos.y as i32,
                    },
                    password: password_gate.password.clone(),
                    open: password_gate.open,
                    fuzzy: fuzzy_password_gate.fuzzy,
                }),
            );
        }

        let data_terminals = Array::new_with_length(state.data_terminals.len() as u32);
        for (i, fuzzy_data_terminal) in state.data_terminals.iter().enumerate() {
            let data_terminal = &fuzzy_data_terminal.obj;
            data_terminals.set(
                i as u32,
                JsValue::from(FuzzyDataTerminal {
                    pos: Pos {
                        x: data_terminal.pos.x as i32,
                        y: data_terminal.pos.y as i32,
                    },
                    data: data_terminal.data.clone(),
                    reading: data_terminal.reading,
                    fuzzy: fuzzy_data_terminal.fuzzy,
                }),
            );
        }

        FuzzyState {
            players,
            fuel_spots,
            goals,
            enemies,
            obstacles,
            password_gates,
            data_terminals,
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct FuzzyPlayer {
    pub pos: Pos,
    pub fuel: i32,
    pub message: String,
    pub anim_state: String, // PlayerAnimState
    pub facing: String,     // Direction
    pub fuzzy: bool,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct FuzzyGoal {
    pub pos: Pos,
    pub fuzzy: bool,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct FuzzyFuelSpot {
    pub pos: Pos,
    pub collected: bool,
    pub fuzzy: bool,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct FuzzyEnemy {
    pub pos: Pos,
    pub anim_state: String, // EnemyAnimState
    pub fuzzy: bool,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct FuzzyObstacle {
    pub pos: Pos,
    pub fuzzy: bool,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct FuzzyPasswordGate {
    pub pos: Pos,
    pub password: String,
    pub open: bool,
    pub fuzzy: bool,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct FuzzyDataTerminal {
    pub pos: Pos,
    pub data: String,
    pub reading: bool,
    pub fuzzy: bool,
}
