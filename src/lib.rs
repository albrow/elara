use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;

mod state;
use state::{State, StateEngine};

mod actors;
use actors::Direction;

use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};

use rhai::Engine;

static mut TX: Option<Sender<Direction>> = None;
static mut RX: Option<Receiver<Direction>> = None;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

// #[wasm_bindgen(module = "node_modules/pixi.js/dist/pixi.js")]
// extern "C" {
//     pub type Sprite;
//     #[wasm_bindgen(constructor)]
//     fn new() -> Sprite;

//     #[wasm_bindgen(method, setter)]
//     fn set_x(this: &Sprite, val: u32) -> u32;

//     #[wasm_bindgen(method, getter)]
//     fn x(this: &Sprite) -> u32;

//     #[wasm_bindgen(method, setter)]
//     fn set_y(this: &Sprite, val: u32) -> u32;

//     #[wasm_bindgen(method, getter)]
//     fn y(this: &Sprite) -> u32;

//     #[wasm_bindgen(method, getter)]
//     fn height(this: &Sprite) -> u32;

//     #[wasm_bindgen(method, getter)]
//     fn width(this: &Sprite) -> u32;
// }

#[wasm_bindgen]
pub struct Game {
    state_engine: StateEngine,
}

#[wasm_bindgen]
impl Game {
    pub fn new(width: u32, height: u32) -> Game {
        console_error_panic_hook::set_once();

        let (tx, rx) = mpsc::channel();
        unsafe {
            TX = Some(tx);
            RX = Some(rx);
        }

        let config = state::Config { width, height };
        let mut state_engine = StateEngine::new(config);

        // For now, add a simple actor to move the player in a circle.
        // engine.add_actor(Box::new(PlayerMoveCircle::new(width - 1, height - 1)));

        Game {
            state_engine: state_engine,
        }
    }

    pub fn get_state(&self) -> JsValue {
        serde_wasm_bindgen::to_value(self.state_engine.curr_state()).unwrap()
    }

    pub fn step_forward(&mut self) {
        self.state_engine.step_forward();
    }

    pub fn step_back(&mut self) {
        self.state_engine.step_back();
    }

    // pub fn set_player_behavior(&mut self, script: String) {}

    pub fn run_player_script(&mut self, script: String) {
        let actor = actors::PlayerChannelActor::new(unsafe { RX.as_ref().unwrap() });
        self.state_engine.add_actor(Box::new(actor));
        let mut engine = Engine::new();
        engine.register_fn("move_right", move |spaces: i64| {
            for _ in 0..spaces {
                unsafe { TX.as_ref().unwrap() }
                    .send(Direction::Right)
                    .unwrap();
            }
        });
        engine.register_fn("move_left", move |spaces: i64| {
            for _ in 0..spaces {
                unsafe { TX.as_ref().unwrap() }
                    .send(Direction::Left)
                    .unwrap();
            }
        });
        engine.register_fn("move_up", move |spaces: i64| {
            for _ in 0..spaces {
                unsafe { TX.as_ref().unwrap() }.send(Direction::Up).unwrap();
            }
        });
        engine.register_fn("move_down", move |spaces: i64| {
            for _ in 0..spaces {
                unsafe { TX.as_ref().unwrap() }
                    .send(Direction::Down)
                    .unwrap();
            }
        });
        engine.run(script.as_str()).unwrap();
    }
}
