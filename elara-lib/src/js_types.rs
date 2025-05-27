use js_sys::{Array, Object};
use wasm_bindgen::prelude::*;

use crate::constants::{ERR_NO_BUTTON, ERR_NO_DATA_POINT};
use crate::levels::{LevelStyle, Outcome};
use crate::script_runner;
use crate::simulation::{
    AsteroidAnimState, BigEnemyAnimState, EnemyAnimState, GateVariant, ObstacleKind, Orientation,
    OrientationWithDiagonals, PlayerAnimState, TermData,
};
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
pub struct StateWithLines {
    pub state: State,
    pub lines: Array, // Array<number>
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
    // Amount of energy used by the rover.
    pub energy_used: i32,
    // Amount of time (i.e. number of steps) taken to execute the script.
    pub time_taken: i32,
}

impl From<&script_runner::ScriptStats> for ScriptStats {
    fn from(stats: &script_runner::ScriptStats) -> Self {
        Self {
            code_len: stats.code_len as i32,
            energy_used: stats.energy_used as i32,
            time_taken: stats.time_taken as i32,
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct RunResult {
    pub states: Array,            // Array<FuzzyStateWithLines>
    pub outcome: String,          // "success" | "continue" | "other failure message"
    pub err_type: Option<String>, // "err_no_button" | "err_no_data_point"
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
            JsValue::from(StateWithLines {
                state: State::from(state.clone()),
                lines: lines_array,
            }),
        );
    }
    let err_type = match &result.outcome {
        Outcome::Failure(message) => {
            if message.contains(ERR_NO_BUTTON) {
                Some(String::from("err_no_button"))
            } else if message.contains(ERR_NO_DATA_POINT) {
                Some(String::from("err_no_data_point"))
            } else {
                None
            }
        }
        _ => None,
    };
    RunResult {
        states: states_array,
        outcome: match &result.outcome {
            Outcome::Success => String::from("success"),
            Outcome::Failure(msg) => msg.clone(),
            Outcome::Continue => String::from("continue"),
            Outcome::NoObjective => String::from("no_objective"),
        },
        stats: ScriptStats::from(&result.stats),
        passes_challenge: result.passes_challenge,
        err_type,
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct LevelData {
    pub name: String,
    pub short_name: String,
    pub style: String, // LevelStyle
    pub camera_text: String,
    pub objective: String,
    pub initial_state: State,
    pub initial_code: String,
    pub disabled_funcs: Array, // Array<String>
    pub challenge: String,
}

impl LevelData {
    pub fn from(level: &dyn levels::Level) -> Self {
        let disabled_funcs = Array::new();
        for func in level.disabled_functions() {
            disabled_funcs.push(&JsValue::from(func.to_string()));
        }
        Self {
            name: level.name().to_string(),
            short_name: level.short_name().to_string(),
            style: match level.style() {
                LevelStyle::Default => "default".to_string(),
                LevelStyle::GlossyTiles => "glossy_tiles".to_string(),
                LevelStyle::Gray => "gray".to_string(),
            },
            camera_text: level.camera_text().to_string(),
            objective: level.objective().to_string(),
            initial_code: level.initial_code().to_string(),
            initial_state: State::from(level.initial_states()[0].clone()),
            disabled_funcs,
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

#[wasm_bindgen]
#[derive(Clone, PartialEq, Debug)]
pub struct AsteroidWarning {
    pub pos: Pos,
    pub steps_until_impact: i32,
    pub will_hit: bool,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct Asteroid {
    pub pos: Pos,
    pub anim_state: String, // AsteroidAnimState
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
                x: data.start_pos.x,
                y: data.start_pos.y,
            },
            enter_pos: Pos {
                x: data.enter_pos.x,
                y: data.enter_pos.y,
            },
            exit_pos: Pos {
                x: data.exit_pos.x,
                y: data.exit_pos.y,
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
                x: data.pos.x,
                y: data.pos.y,
            },
            obstacle_pos: Pos {
                x: data.obstacle_pos.x,
                y: data.obstacle_pos.y,
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

fn get_js_enemy_anim_data(anim_state: &EnemyAnimState) -> Option<JsValue> {
    match anim_state {
        EnemyAnimState::Teleporting(data) => Some(TeleAnimData::from(data).into()),
        EnemyAnimState::Bumping(data) => Some(BumpAnimData::from(data).into()),
        _ => None,
    }
}

fn get_js_big_enemy_anim_data(anim_state: &BigEnemyAnimState) -> Option<JsValue> {
    match anim_state {
        BigEnemyAnimState::Bumping(data) => Some(BumpAnimData::from(data).into()),
        _ => None,
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct State {
    pub player: Player,
    pub energy_cells: Array,      // Array<EnergyCell>
    pub goals: Array,             // Array<Goal>
    pub enemies: Array,           // Array<Enemy>
    pub obstacles: Array,         // Array<Obstacle>
    pub password_gates: Array,    // Array<PasswordGate>
    pub data_points: Array,       // Array<DataPoint>
    pub telepads: Array,          // Array<Telepad>
    pub buttons: Array,           // Array<Button>
    pub gates: Array,             // Array<Gate>
    pub big_enemies: Array,       // Array<BigEnemy>
    pub crates: Array,            // Array<Crate>
    pub asteroid_warnings: Array, // Array<AsteroidWarning>
    pub asteroids: Array,         // Array<Asteroid>
}

impl State {
    pub fn from(state: simulation::State) -> Self {
        let energy_cells = Array::new_with_length(state.energy_cells.len() as u32);
        for (i, energy_cell) in state.energy_cells.iter().enumerate() {
            energy_cells.set(
                i as u32,
                JsValue::from(EnergyCell {
                    pos: Pos {
                        x: energy_cell.pos.x,
                        y: energy_cell.pos.y,
                    },
                    collected: energy_cell.collected,
                }),
            );
        }

        let goals = Array::new_with_length(state.goals.len() as u32);
        for (i, goal) in state.goals.iter().enumerate() {
            goals.set(
                i as u32,
                JsValue::from(Goal {
                    pos: Pos {
                        x: goal.pos.x,
                        y: goal.pos.y,
                    },
                }),
            );
        }

        let enemies = Array::new_with_length(state.enemies.len() as u32);
        for (i, enemy) in state.enemies.iter().enumerate() {
            let anim_state = match enemy.anim_state {
                EnemyAnimState::Idle => "idle",
                EnemyAnimState::Moving => "moving",
                EnemyAnimState::Turning => "turning",
                EnemyAnimState::Teleporting(_) => "teleporting",
                EnemyAnimState::Bumping(_) => "bumping",
            };
            let facing = match enemy.facing {
                Orientation::Up => "up",
                Orientation::Down => "down",
                Orientation::Left => "left",
                Orientation::Right => "right",
            };
            let anim_data = get_js_enemy_anim_data(&enemy.anim_state).unwrap_or(JsValue::UNDEFINED);
            enemies.set(
                i as u32,
                JsValue::from(Enemy {
                    pos: Pos {
                        x: enemy.pos.x,
                        y: enemy.pos.y,
                    },
                    anim_state: anim_state.to_string(),
                    anim_data,
                    facing: facing.to_string(),
                }),
            );
        }

        let obstacles = Array::new_with_length(state.obstacles.len() as u32);
        for (i, obstacle) in state.obstacles.iter().enumerate() {
            obstacles.set(
                i as u32,
                JsValue::from(Obstacle {
                    pos: Pos {
                        x: obstacle.pos.x,
                        y: obstacle.pos.y,
                    },
                    kind: match obstacle.kind {
                        ObstacleKind::Rock => "rock".to_string(),
                        ObstacleKind::Server => "server".to_string(),
                    },
                }),
            );
        }

        let password_gates = Array::new_with_length(state.password_gates.len() as u32);
        for (i, pw_gate) in state.password_gates.iter().enumerate() {
            let variant = match pw_gate.variant {
                GateVariant::NWSE => "nwse".to_string(),
                GateVariant::NESW => "nesw".to_string(),
            };
            password_gates.set(
                i as u32,
                JsValue::from(PasswordGate {
                    pos: Pos {
                        x: pw_gate.pos.x,
                        y: pw_gate.pos.y,
                    },
                    password: pw_gate.password.clone(),
                    open: pw_gate.open,
                    variant,
                    additional_info: pw_gate.additional_info.clone(),
                    wrong_password: pw_gate.wrong_password,
                }),
            );
        }

        let data_points = Array::new_with_length(state.data_points.len() as u32);
        for (i, data_point) in state.data_points.iter().enumerate() {
            data_points.set(
                i as u32,
                JsValue::from(DataPoint {
                    pos: Pos {
                        x: data_point.pos.x,
                        y: data_point.pos.y,
                    },
                    data: term_data_to_js(&data_point.data),
                    reading: data_point.reading,
                    additional_info: data_point.additional_info.clone(),
                }),
            );
        }

        let telepads = Array::new_with_length(state.telepads.len() as u32);
        for (i, telepad) in state.telepads.iter().enumerate() {
            telepads.set(
                i as u32,
                JsValue::from(Telepad {
                    start_pos: Pos {
                        x: telepad.start_pos.x,
                        y: telepad.start_pos.y,
                    },
                    end_pos: Pos {
                        x: telepad.end_pos.x,
                        y: telepad.end_pos.y,
                    },
                    end_facing: match telepad.end_facing {
                        Orientation::Up => "up".to_string(),
                        Orientation::Down => "down".to_string(),
                        Orientation::Left => "left".to_string(),
                        Orientation::Right => "right".to_string(),
                    },
                }),
            );
        }

        let buttons = Array::new_with_length(state.buttons.len() as u32);
        for (i, button) in state.buttons.iter().enumerate() {
            buttons.set(
                i as u32,
                JsValue::from(Button {
                    pos: Pos {
                        x: button.pos.x,
                        y: button.pos.y,
                    },
                    connection_type: match button.connection {
                        simulation::ButtonConnection::None => "none".to_string(),
                        simulation::ButtonConnection::Gate(_) => "gate".to_string(),
                    },
                    connection_index: match button.connection {
                        simulation::ButtonConnection::None => 0,
                        simulation::ButtonConnection::Gate(index) => index as i32,
                    },
                    currently_pressed: button.currently_pressed,
                    additional_info: button.additional_info.clone(),
                }),
            );
        }

        let gates = Array::new_with_length(state.gates.len() as u32);
        for (i, gate) in state.gates.iter().enumerate() {
            let variant = match gate.variant {
                simulation::GateVariant::NWSE => "nwse".to_string(),
                simulation::GateVariant::NESW => "nesw".to_string(),
            };
            gates.set(
                i as u32,
                JsValue::from(Gate {
                    pos: Pos {
                        x: gate.pos.x,
                        y: gate.pos.y,
                    },
                    open: gate.open,
                    variant,
                    additional_info: gate.additional_info.clone(),
                }),
            );
        }

        let big_enemies = Array::new_with_length(state.big_enemies.len() as u32);
        for (i, big_enemy) in state.big_enemies.iter().enumerate() {
            let anim_state = match big_enemy.anim_state {
                BigEnemyAnimState::Idle => "idle",
                BigEnemyAnimState::Moving => "moving",
                BigEnemyAnimState::Turning => "turning",
                BigEnemyAnimState::Bumping(_) => "bumping",
            };
            let anim_data =
                get_js_big_enemy_anim_data(&big_enemy.anim_state).unwrap_or(JsValue::UNDEFINED);
            big_enemies.set(
                i as u32,
                JsValue::from(BigEnemy {
                    pos: Pos {
                        x: big_enemy.pos.x,
                        y: big_enemy.pos.y,
                    },
                    facing: match big_enemy.facing {
                        OrientationWithDiagonals::Up => "up".to_string(),
                        OrientationWithDiagonals::Down => "down".to_string(),
                        OrientationWithDiagonals::Left => "left".to_string(),
                        OrientationWithDiagonals::Right => "right".to_string(),
                        OrientationWithDiagonals::UpLeft => "up_left".to_string(),
                        OrientationWithDiagonals::UpRight => "up_right".to_string(),
                        OrientationWithDiagonals::DownLeft => "down_left".to_string(),
                        OrientationWithDiagonals::DownRight => "down_right".to_string(),
                    },
                    anim_state: anim_state.to_string(),
                    anim_data,
                }),
            );
        }

        let crates = Array::new_with_length(state.crates.len() as u32);
        for (i, crt) in state.crates.iter().enumerate() {
            crates.set(
                i as u32,
                JsValue::from(Crate {
                    pos: Pos {
                        x: crt.pos.x,
                        y: crt.pos.y,
                    },
                    held: crt.held,
                    color: match crt.color {
                        simulation::CrateColor::Red => "red".to_string(),
                        simulation::CrateColor::Green => "green".to_string(),
                        simulation::CrateColor::Blue => "blue".to_string(),
                    },
                }),
            );
        }

        let asteroid_warnings = Array::new_with_length(state.asteroid_warnings.len() as u32);
        for (i, asteroid_warning) in state.asteroid_warnings.iter().enumerate() {
            asteroid_warnings.set(
                i as u32,
                JsValue::from(AsteroidWarning {
                    pos: Pos {
                        x: asteroid_warning.pos.x,
                        y: asteroid_warning.pos.y,
                    },
                    steps_until_impact: asteroid_warning.steps_until_impact as i32,
                    will_hit: asteroid_warning.will_hit,
                }),
            );
        }

        let asteroids = Array::new_with_length(state.asteroids.len() as u32);
        for (i, asteroid) in state.asteroids.iter().enumerate() {
            let anim_state = match asteroid.anim_state {
                AsteroidAnimState::Falling => "falling",
                AsteroidAnimState::RecentlyHitGround => "recently_hit_ground",
                AsteroidAnimState::Stationary => "stationary",
            };
            asteroids.set(
                i as u32,
                JsValue::from(Asteroid {
                    pos: Pos {
                        x: asteroid.pos.x,
                        y: asteroid.pos.y,
                    },
                    anim_state: anim_state.to_string(),
                }),
            );
        }

        State {
            player: Player::from(state.player),
            energy_cells,
            goals,
            enemies,
            obstacles,
            password_gates,
            data_points,
            telepads,
            buttons,
            gates,
            big_enemies,
            crates,
            asteroid_warnings,
            asteroids,
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
pub struct Player {
    pub pos: Pos,
    pub energy: i32,
    pub message: String,
    pub err_message: String,
    pub anim_state: String, // PlayerAnimState
    pub anim_data: JsValue, // TeleAnimData | BumpAnimData |(other animation data types) | undefined
    pub facing: String,     // Orientation
}

impl Player {
    pub fn from(player: simulation::Player) -> Self {
        let anim_state = match player.anim_state {
            PlayerAnimState::Idle => "idle",
            PlayerAnimState::Moving => "moving",
            PlayerAnimState::Turning => "turning",
            PlayerAnimState::Teleporting(_) => "teleporting",
            PlayerAnimState::Bumping(_) => "bumping",
            PlayerAnimState::PickingUp => "picking_up",
            PlayerAnimState::Dropping => "dropping",
            PlayerAnimState::DropBumping(_) => "drop_bumping",
        };
        let facing = match player.facing {
            Orientation::Up => "up",
            Orientation::Down => "down",
            Orientation::Left => "left",
            Orientation::Right => "right",
        };
        let anim_data = get_js_player_anim_data(&player.anim_state).unwrap_or(JsValue::UNDEFINED);
        Self {
            pos: Pos {
                x: player.pos.x,
                y: player.pos.y,
            },
            energy: player.energy as i32,
            message: player.message.clone(),
            err_message: player.err_message.clone(),
            anim_state: anim_state.to_string(),
            anim_data,
            facing: facing.to_string(),
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Goal {
    pub pos: Pos,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct EnergyCell {
    pub pos: Pos,
    pub collected: bool,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct Enemy {
    pub pos: Pos,
    pub anim_state: String, // EnemyAnimState
    pub anim_data: JsValue, // TeleAnimData | BumpAnimData | (other animation data types) | undefined
    pub facing: String,     // Orientation
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct BigEnemy {
    pub pos: Pos,
    pub anim_state: String, // EnemyAnimState
    pub anim_data: JsValue, // TeleAnimData | BumpAnimData | (other animation data types) | undefined
    pub facing: String,     // Orientation
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct Obstacle {
    pub pos: Pos,
    pub kind: String, // ObstacleKind
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct PasswordGate {
    pub pos: Pos,
    pub password: String,
    pub open: bool,
    pub variant: String, // GateVariant
    pub additional_info: String,
    pub wrong_password: bool,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct DataPoint {
    pub pos: Pos,
    pub data: JsValue, // string | string[]
    pub reading: bool,
    pub additional_info: String,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct Telepad {
    pub start_pos: Pos,
    pub end_pos: Pos,
    pub end_facing: String, // Orientation
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct Button {
    pub pos: Pos,
    pub currently_pressed: bool,
    pub additional_info: String,
    pub connection_type: String, // ButtonConnection
    pub connection_index: i32,   // E.g., for ButtonConnection::Gate, the index of the gate.
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct Gate {
    pub pos: Pos,
    pub open: bool,
    pub variant: String, // GateVariant
    pub additional_info: String,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Debug)]
pub struct Crate {
    pub pos: Pos,
    pub held: bool,
    pub color: String, // CrateColor
}
