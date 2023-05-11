use js_sys::{Array, Object};
use wasm_bindgen::prelude::*;

use crate::levels::Outcome;
use crate::script_runner;
use crate::simulation::{EnemyAnimState, Orientation, PlayerAnimState, TermData};
use crate::{levels, simulation};

#[wasm_bindgen(getter_with_clone)]
pub struct RhaiError {
    pub message: String,
    pub line: usize,
    pub col: usize,
}

/// The state and active line numbers associated with each step in
/// a simulation run.
#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct FuzzyStateWithLines {
    pub state: FuzzyState,
    pub lines: Array, // Array<number>
}

#[wasm_bindgen]
impl FuzzyStateWithLines {
    pub fn new() -> FuzzyStateWithLines {
        FuzzyStateWithLines {
            state: FuzzyState::new(),
            lines: Array::new_with_length(0),
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
pub struct ScriptStats {
    // Length of the script in bytes.
    pub code_len: i32,
    // Amount of fuel used by the rover.
    pub fuel_used: i32,
    // Amount of time (i.e. number of steps) taken to execute the script.
    pub time_taken: i32,
}

impl From<&script_runner::ScriptStats> for ScriptStats {
    fn from(stats: &script_runner::ScriptStats) -> Self {
        Self {
            code_len: stats.code_len as i32,
            fuel_used: stats.fuel_used as i32,
            time_taken: stats.time_taken as i32,
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct RunResult {
    pub states: Array,   // Array<FuzzyStateWithLines>
    pub outcome: String, // "success" | "continue" | "other failure message"
    pub stats: ScriptStats,
    pub passes_challenge: bool,
}

/// Converts script_runner::ScriptResult to a format that is wasm_bindgen
/// compatible and can ultimately be used by the JavaScript code.
pub fn to_js_run_result(result: &script_runner::ScriptResult) -> RunResult {
    let states_array = Array::new_with_length(result.states.len() as u32);
    for (i, (state, lines)) in result.states.iter().zip(result.trace.iter()).enumerate() {
        let lines_array = Array::new_with_length(lines.len() as u32);
        for (j, &line_number) in lines.iter().enumerate() {
            lines_array.set(j as u32, line_number.into());
        }
        states_array.set(
            i as u32,
            JsValue::from(FuzzyStateWithLines {
                state: FuzzyState::from(levels::FuzzyState::from_single_state(state)),
                lines: lines_array,
            }),
        );
    }
    RunResult {
        states: states_array,
        outcome: match result.outcome.clone() {
            Outcome::Success => String::from("success"),
            Outcome::Failure(msg) => msg,
            Outcome::Continue => String::from("continue"),
            Outcome::NoObjective => String::from("no_objective"),
        },
        stats: ScriptStats::from(&result.stats),
        passes_challenge: result.passes_challenge,
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
    pub available_functions: Array, // Array<String>
    pub challenge: String,
}

impl LevelData {
    pub fn from(level: &dyn levels::Level) -> Self {
        let avail_funcs = Array::new();
        for func in level.available_functions() {
            avail_funcs.push(&JsValue::from(func.to_string()));
        }
        Self {
            name: level.name().to_string(),
            short_name: level.short_name().to_string(),
            objective: level.objective().to_string(),
            initial_code: level.initial_code().to_string(),
            initial_state: FuzzyState::from(level.initial_fuzzy_state()),
            available_functions: avail_funcs,
            challenge: level.challenge().unwrap_or_default().to_string(),
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

/// Special metadata which can be used for teleportation animations in the UI.
/// Includes:
///    - start_pos: The position of the rover before entering telepad.
///    - enter_pos: The position of the telepad entrance.
///    - exit_pos: The position of the telepad exit.
#[derive(Clone, PartialEq, Debug)]
#[wasm_bindgen(getter_with_clone)]
pub struct TeleAnimData {
    pub start_pos: Pos,
    pub enter_pos: Pos,
    pub exit_pos: Pos,
}

impl TeleAnimData {
    pub fn from(data: &simulation::TeleAnimData) -> Self {
        Self {
            start_pos: Pos {
                x: data.start_pos.x as i32,
                y: data.start_pos.y as i32,
            },
            enter_pos: Pos {
                x: data.enter_pos.x as i32,
                y: data.enter_pos.y as i32,
            },
            exit_pos: Pos {
                x: data.exit_pos.x as i32,
                y: data.exit_pos.y as i32,
            },
        }
    }
}

/// Special metadata which can be used for teleportation animations in the UI.
/// Includes:
///    - pos: The position of the rover.
///    - obstacle_pos: The position of the obstacle which the rover is bumping into.
#[derive(Clone, PartialEq, Debug)]
#[wasm_bindgen(getter_with_clone)]
pub struct BumpAnimData {
    pub pos: Pos,
    pub obstacle_pos: Pos,
}

impl BumpAnimData {
    pub fn from(data: &simulation::BumpAnimData) -> Self {
        Self {
            pos: Pos {
                x: data.pos.x as i32,
                y: data.pos.y as i32,
            },
            obstacle_pos: Pos {
                x: data.obstacle_pos.x as i32,
                y: data.obstacle_pos.y as i32,
            },
        }
    }
}

fn get_js_player_anim_data(anim_state: &PlayerAnimState) -> Option<JsValue> {
    match anim_state {
        PlayerAnimState::Teleporting(data) => Some(TeleAnimData::from(data).into()),
        PlayerAnimState::Bumping(data) => Some(BumpAnimData::from(data).into()),
        _ => None,
    }
}

fn get_js_enemy_anim_data(anim_state: &EnemyAnimState) -> Option<TeleAnimData> {
    match anim_state {
        EnemyAnimState::Teleporting(data) => Some(TeleAnimData::from(data).into()),
        _ => None,
    }
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
    pub telepads: Array,       // Array<FuzzyTelepad>
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
            telepads: Array::new(),
        }
    }

    pub fn from(state: levels::FuzzyState) -> Self {
        let players = Array::new_with_length(state.players.len() as u32);
        for (i, fuzzy_player) in state.players.iter().enumerate() {
            let anim_state = match fuzzy_player.obj.anim_state {
                PlayerAnimState::Idle => "idle",
                PlayerAnimState::Moving => "moving",
                PlayerAnimState::Turning => "turning",
                PlayerAnimState::Teleporting(_) => "teleporting",
                PlayerAnimState::Bumping(_) => "bumping",
            };
            let facing = match fuzzy_player.obj.facing {
                Orientation::Up => "up",
                Orientation::Down => "down",
                Orientation::Left => "left",
                Orientation::Right => "right",
            };
            let anim_data =
                get_js_player_anim_data(&fuzzy_player.obj.anim_state).unwrap_or(JsValue::UNDEFINED);
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
                    anim_data: anim_data,
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
                EnemyAnimState::Turning => "turning",
                EnemyAnimState::Teleporting(_) => "teleporting",
            };
            let facing = match enemy.facing {
                Orientation::Up => "up",
                Orientation::Down => "down",
                Orientation::Left => "left",
                Orientation::Right => "right",
            };
            enemies.set(
                i as u32,
                JsValue::from(FuzzyEnemy {
                    pos: Pos {
                        x: enemy.pos.x as i32,
                        y: enemy.pos.y as i32,
                    },
                    anim_state: anim_state.to_string(),
                    anim_data: get_js_enemy_anim_data(&enemy.anim_state),
                    facing: facing.to_string(),
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
                    data: term_data_to_js(&data_terminal.data),
                    reading: data_terminal.reading,
                    fuzzy: fuzzy_data_terminal.fuzzy,
                }),
            );
        }

        let telepads = Array::new_with_length(state.telepads.len() as u32);
        for (i, fuzzy_telepad) in state.telepads.iter().enumerate() {
            let telepad = &fuzzy_telepad.obj;
            telepads.set(
                i as u32,
                JsValue::from(FuzzyTelepad {
                    start_pos: Pos {
                        x: telepad.start_pos.x as i32,
                        y: telepad.start_pos.y as i32,
                    },
                    end_pos: Pos {
                        x: telepad.end_pos.x as i32,
                        y: telepad.end_pos.y as i32,
                    },
                    end_facing: match telepad.end_facing {
                        Orientation::Up => "up".to_string(),
                        Orientation::Down => "down".to_string(),
                        Orientation::Left => "left".to_string(),
                        Orientation::Right => "right".to_string(),
                    },
                    fuzzy: fuzzy_telepad.fuzzy,
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
            telepads,
        }
    }
}

fn term_data_to_js(data: &TermData) -> JsValue {
    match data {
        TermData::String(str) => JsValue::from_str(str),
        TermData::Array(arr) => {
            let js_arr = Array::new_with_length(arr.len() as u32);
            for (i, item) in arr.iter().enumerate() {
                js_arr.set(i as u32, term_data_to_js(item));
            }
            JsValue::from(js_arr)
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
    pub anim_data: JsValue, // TeleAnimData | BumpAnimData |(other animation data types) | undefined
    pub facing: String,     // Orientation
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
    pub anim_state: String,              // EnemyAnimState
    pub anim_data: Option<TeleAnimData>, // TeleAnimData | (other animation data types) | undefined
    pub facing: String,                  // Orientation
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
    pub data: JsValue, // string | string[]
    pub reading: bool,
    pub fuzzy: bool,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct FuzzyTelepad {
    pub start_pos: Pos,
    pub end_pos: Pos,
    pub end_facing: String, // Orientation
    pub fuzzy: bool,
}
