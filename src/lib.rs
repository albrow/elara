extern crate console_error_panic_hook;

use wasm_bindgen::prelude::*;
mod state;
use state::{Player, Pos, State, StateEngine};
mod actors;
use actors::{Action, Bounds, Direction};
use js_sys::Array;
use rhai::debugger::DebuggerCommand;
use rhai::{ASTNode, Dynamic, Engine, Stmt};
use std::sync::mpsc;

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
static mut PLAYER_ACTION_TX: Option<mpsc::Sender<Action>> = None;
static mut PLAYER_ACTION_RX: Option<mpsc::Receiver<Action>> = None;

#[wasm_bindgen]
/// Game is the main entry point for the game. It is responsible for
/// managing state, running user scripts, and gluing all the pieces
/// together.
pub struct Game {
    width: u32,
    height: u32,
    state_engine: StateEngine,
    player_action_tx: &'static mpsc::Sender<Action>,
    player_action_rx: &'static mpsc::Receiver<Action>,
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

        let state_engine = StateEngine::new();

        Game {
            width,
            height,
            state_engine: state_engine,
            player_action_tx: unsafe { PLAYER_ACTION_TX.as_ref().unwrap() },
            player_action_rx: unsafe { PLAYER_ACTION_RX.as_ref().unwrap() },
        }
    }

    pub fn get_state(&self) -> State {
        self.state_engine.curr_state().borrow().clone()
    }

    pub fn step_forward(&mut self) {
        self.state_engine.step_forward();
    }

    pub fn step_back(&mut self) {
        self.state_engine.step_back();
    }

    pub async fn run_player_script(&mut self, script: String) -> Result<Array, JsValue> {
        let bounds = Bounds {
            max_x: self.width,
            max_y: self.height,
        };
        let actor = actors::PlayerChannelActor::new(self.player_action_rx, bounds);
        self.state_engine.add_actor(Box::new(actor));

        let mut engine = Engine::new();
        set_engine_safegaurds(&mut engine);
        set_print_fn(&mut engine);

        let mut state = self.state_engine.curr_state().clone();
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
                                log!("move_right detected at line {}", pos.line().unwrap());
                                // Temporary: Should really be calling state_engine.step_forward()
                                // If we can do this, calling get_state from the script will work
                                // correctly :)
                                state.borrow_mut().player.pos.x += 1;
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_left" => {
                                log!("move_left detected at line {}", pos.line().unwrap());
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_up" => {
                                log!("move_up detected at line {}", pos.line().unwrap());
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_down" => {
                                log!("move_down detected at line {}", pos.line().unwrap());
                                Ok(DebuggerCommand::StepInto)
                            }
                            _ => Ok(DebuggerCommand::StepInto),
                        }
                    }
                    _ => Ok(DebuggerCommand::StepInto),
                }
            },
        );

        // Register types.
        register_custom_types(&mut engine);

        // Register functions for each action that can exist in a user script.
        // Each function will simply send the corresponding action(s) through
        // the channel.
        let tx = self.player_action_tx;
        engine.register_fn("wait", move |duration: i64| {
            for _ in 0..duration {
                tx.send(Action::Wait).unwrap();
            }
        });
        engine.register_fn("move_right", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Action::Move(Direction::Right)).unwrap();
            }
        });
        engine.register_fn("move_left", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Action::Move(Direction::Left)).unwrap();
            }
        });
        engine.register_fn("move_up", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Action::Move(Direction::Up)).unwrap();
            }
        });
        engine.register_fn("move_down", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Action::Move(Direction::Down)).unwrap();
            }
        });
        // TODO(albrow): Figure out a way to read current state. Maybe make
        // a global static state variable and update it every time the state
        // changes?
        let curr_state_ref = self.state_engine.curr_state().clone();
        engine.register_fn("get_state", move || curr_state_ref.borrow().clone());

        // Make engine non-mutable now that we are done registering functions.
        let engine = engine;
        // TODO(albrow): Consider using progress tracker to count the number of
        // operations. Could be visualized as "feul" for your drone/robot that
        // will eventually run out if your script runs too long.
        //
        // TODO(albrow): Handle errors better here.
        engine.run(script.as_str()).unwrap();

        // TODO(albrow): Return a list of states that resulted from script
        // execution.
        // let states: Array = self
        //     .state_engine
        //     .all_states()
        //     .to_vec()
        //     .into_iter()
        //     .map(JsValue::from)
        //     .collect();
        Ok(Array::new())
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

fn set_print_fn(engine: &mut Engine) {
    engine.on_print(move |s: &str| {
        log!("{}", s);
    });
}

fn register_custom_types(engine: &mut Engine) {
    engine
        .register_type_with_name::<State>("State")
        .register_get("player", State::get_player);
    engine
        .register_type_with_name::<Player>("Player")
        .register_get("position", Player::get_pos);
    engine
        .register_type_with_name::<Pos>("Position")
        .register_get("x", Pos::get_x)
        .register_get("y", Pos::get_y);
}
