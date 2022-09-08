use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;

mod state;
use state::{State, StateEngine};

mod actors;
use actors::PlayerMoveCircle;

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

        let config = state::Config { width, height };
        let mut engine = StateEngine::new(config);

        // For now, add a simple actor to move the player in a circle.
        // engine.add_actor(Box::new(PlayerMoveCircle::new(width - 1, height - 1)));

        Game {
            state_engine: engine,
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

    pub fn set_player_behavior(&mut self, script: String) {
        let actor = actors::PlayerScriptActor::from_script(script);
        self.state_engine.add_actor(Box::new(actor));
    }
}
