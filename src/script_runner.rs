use crate::actors::{Action, Direction};
use crate::simulation::{Player, Pos, Simulation, State};
use rhai::debugger::DebuggerCommand;
use rhai::{ASTNode, Dynamic, Engine, EvalAltResult, Stmt};
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;

pub struct ScriptRunner {
    simulation: Rc<RefCell<Simulation>>,
    player_action_tx: &'static mpsc::Sender<Action>,
}

impl ScriptRunner {
    pub fn new(
        simulation: Rc<RefCell<Simulation>>,
        player_action_tx: &'static mpsc::Sender<Action>,
    ) -> ScriptRunner {
        ScriptRunner {
            simulation,
            player_action_tx,
        }
    }

    pub fn run(&mut self, script: String) -> Result<Vec<State>, EvalAltResult> {
        // Create and configure the Rhai engine.
        let mut engine = Engine::new();
        set_engine_safegaurds(&mut engine);
        set_print_fn(&mut engine);
        self.register_debugger(&mut engine);
        register_custom_types(&mut engine);
        self.register_player_funcs(&mut engine);

        // Make engine non-mutable now that we are done configuring it.
        // This is a saftey measure to prevent scripts from mutating the
        // engine.
        let engine = engine;

        // TODO(albrow): Consider using progress tracker to count the number of
        // operations. Could be visualized as "feul" for your drone/robot that
        // will eventually run out if your script runs too long.
        // TODO(albrow): Handle errors better here.
        engine.run(script.as_str()).unwrap();

        // TODO(albrow): Return a list of states that resulted from script
        // execution.
        let states = self.simulation.borrow().get_history();
        Ok(states)
    }

    fn register_debugger(&self, engine: &mut Engine) {
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
    }

    /// Register functions for each action that can exist in a user script.
    /// Each function will simply send the corresponding action(s) through
    /// the channel.
    fn register_player_funcs(&self, engine: &mut Engine) {
        // For each function, we clone andn borrow the simulation. This is
        // a workaround due to the fact that the Rhai engine does not allow
        // for mutable non-static references in handlers. See
        // https://rhai.rs/book/patterns/control.html for more context.
        let tx = self.player_action_tx;
        let simulation = self.simulation.clone();
        engine.register_fn("wait", move |duration: i64| {
            for _ in 0..duration {
                tx.send(Action::Wait).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });

        let simulation = self.simulation.clone();
        engine.register_fn("move_right", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Action::Move(Direction::Right)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let simulation = self.simulation.clone();
        engine.register_fn("move_left", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Action::Move(Direction::Left)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let simulation = self.simulation.clone();
        engine.register_fn("move_up", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Action::Move(Direction::Up)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let simulation = self.simulation.clone();
        engine.register_fn("move_down", move |spaces: i64| {
            for _ in 0..spaces {
                tx.send(Action::Move(Direction::Down)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let simulation = self.simulation.clone();
        engine.register_fn("get_state", move || simulation.borrow().curr_state());
    }
}

fn set_engine_safegaurds(engine: &mut Engine) {
    // See https://rhai.rs/book/safety/
    engine.set_max_string_size(200);
    engine.set_max_array_size(100);
    engine.set_max_map_size(100);
    engine.set_max_operations(10_000);
    engine.set_max_call_levels(32);
    engine.set_max_expr_depths(64, 32);
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

    // TODO(albrow): Convert types to i64 to make
    // them more compatible with Rhai. Currently,
    // you sometimes have to do a to_int call on the scripting side.
    engine
        .register_type_with_name::<Pos>("Position")
        .register_get("x", Pos::get_x)
        .register_get("y", Pos::get_y);
}
