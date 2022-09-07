use wasm_bindgen::prelude::*;

mod state;
use state::StateEngine;

mod actors;
use actors::PlayerMoveCircle;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();

    Ok(())
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
        let config = state::Config { width, height };
        let mut engine = StateEngine::new(config);

        // For now, add a simple actor to move the player in a circle.
        engine.add_actor(Box::new(PlayerMoveCircle::new(width - 1, height - 1)));

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
}
