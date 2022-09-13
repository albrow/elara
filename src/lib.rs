use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;

mod state;
use state::StateEngine;

mod actors;
use actors::Direction;

use std::sync::mpsc;

use rhai::debugger::DebuggerCommand;
use rhai::{ASTNode, Dynamic, Engine, Stmt};

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

// Note(albrow): These channels will be used to communicate between the
// Rhai script and the Rust code, particularly the StateEngine. They are
// ultimately used in a function which is registered with the Rhai Engine via
// register_function, which requires a static lifetime.
static mut PLAYER_ACTION_TX: Option<mpsc::Sender<Direction>> = None;
static mut PLAYER_ACTION_RX: Option<mpsc::Receiver<Direction>> = None;

#[wasm_bindgen]
/// Game is the main entry point for the game. It is responsible for
/// managing state, running user scripts, and gluing all the pieces
/// together.
pub struct Game {
    state_engine: StateEngine,
    player_action_tx: &'static mpsc::Sender<Direction>,
    player_action_rx: &'static mpsc::Receiver<Direction>,
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

        let config = state::Config { width, height };
        let state_engine = StateEngine::new(config);

        Game {
            state_engine: state_engine,
            player_action_tx: unsafe { PLAYER_ACTION_TX.as_ref().unwrap() },
            player_action_rx: unsafe { PLAYER_ACTION_RX.as_ref().unwrap() },
        }
    }

    // TODO(albrow): Use wasm_bindgen here instead of returning a JsValue.
    pub fn get_state(&self) -> JsValue {
        serde_wasm_bindgen::to_value(self.state_engine.curr_state()).unwrap()
    }

    pub fn step_forward(&mut self) {
        self.state_engine.step_forward();
    }

    pub fn step_back(&mut self) {
        self.state_engine.step_back();
    }

    pub async fn run_player_script(&mut self, script: String) {
        let actor = actors::PlayerChannelActor::new(self.player_action_rx);
        self.state_engine.add_actor(Box::new(actor));

        let mut engine = Engine::new();
        set_engine_safegaurds(&mut engine);

        engine.register_debugger(
            |_| Dynamic::from(()),
            move |_context, _event, node, _source, pos| {
                // println!("{:?}: {:?} at {}", event, node, pos);
                match node {
                    ASTNode::Stmt(Stmt::FnCall(fn_call_expr, ..)) => {
                        match fn_call_expr.name.as_str() {
                            "move_right" => {
                                // TODO(albrow): Evaluate argument to determine how many
                                // spaces to use. We can use this for tracking which line
                                // of code is "running" for each step (e.g. by highlighting
                                // the line in the editor).
                                //
                                // See https://docs.rs/rhai/latest/rhai/struct.Engine.html#method.eval_expression_with_scope
                                log!("Paused at line {} move_right", pos.line().unwrap());
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_left" => {
                                log!("Paused at line {} move_left", pos.line().unwrap());
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_up" => {
                                log!("Paused at line {} move_up", pos.line().unwrap());
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_down" => {
                                log!("Paused at line {} move_down", pos.line().unwrap());
                                Ok(DebuggerCommand::StepInto)
                            }
                            _ => Ok(DebuggerCommand::StepInto),
                        }
                    }
                    _ => Ok(DebuggerCommand::StepInto),
                }
            },
        );

        // Register functions for each action that can exist in a user script.
        // Each function will simply send the corresponding action(s) through
        // the channel.
        let tx = self.player_action_tx;
        engine.register_fn("move_right", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Direction::Right).unwrap();
            }
        });
        engine.register_fn("move_left", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Direction::Left).unwrap();
            }
        });
        engine.register_fn("move_up", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Direction::Up).unwrap();
            }
        });
        engine.register_fn("move_down", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Direction::Down).unwrap();
            }
        });

        // Make engine non-mutable now that we are done registering functions.
        let engine = engine;
        // TODO(albrow): Consider using progress tracker to count the number of
        // operations. Could be visualized as "feul" for your drone/robot that
        // will eventually run out if your script runs too long.
        //
        // TODO(albrow): Handle errors better here.
        engine.run(script.as_str()).unwrap();
    }
}

fn set_engine_safegaurds(engine: &mut Engine) {
    // See https://rhai.rs/book/safety/
    engine.set_max_string_size(200);
    engine.set_max_array_size(100);
    engine.set_max_map_size(100);
    engine.set_max_operations(10_000);
    engine.set_max_call_levels(32);
    engine.set_max_expr_depths(32, 16);
}
