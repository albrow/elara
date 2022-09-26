use crate::actors::{Action, Direction};
use crate::simulation::{Player, Pos, Simulation, State};
use rhai::debugger::DebuggerCommand;
use rhai::{ASTNode, Dynamic, Engine, EvalAltResult, EvalContext, FnCallExpr, Position, Stmt};
use std::cell::RefCell;
use std::io::{Error, ErrorKind};
use std::rc::Rc;
use std::sync::mpsc;

/// Responsible for running user scripts and coordinating communication
/// between the Rhai Engine and the Simulation.
pub struct ScriptRunner {
    simulation: Rc<RefCell<Simulation>>,
    player_action_tx: &'static mpsc::Sender<Action>,
    /// Tracks which lines of code in the user script cause the simulation to
    /// step forward. This is used to highlight active/running lines of code in
    /// the editor UI.
    step_positions: Rc<RefCell<Vec<Position>>>,
}

impl ScriptRunner {
    pub fn new(
        simulation: Rc<RefCell<Simulation>>,
        player_action_tx: &'static mpsc::Sender<Action>,
    ) -> ScriptRunner {
        ScriptRunner {
            simulation,
            player_action_tx,
            // Start with NONE position for step 0. This ensures that
            // the positions aline with simulation steps.
            step_positions: Rc::new(RefCell::new(vec![Position::NONE])),
        }
    }

    pub fn run(
        &mut self,
        script: String,
    ) -> Result<(Vec<State>, Vec<Position>), Box<EvalAltResult>> {
        // Create and configure the Rhai engine.
        let mut engine = Engine::new();
        set_engine_safegaurds(&mut engine);
        set_print_fn(&mut engine);
        self.register_debugger(&mut engine);
        register_custom_types(&mut engine);
        self.register_player_funcs(&mut engine);

        // Reset step_positions.
        self.step_positions.borrow_mut().clear();
        self.step_positions.borrow_mut().push(Position::NONE);

        // Make engine non-mutable now that we are done configuring it.
        // This is a saftey measure to prevent scripts from mutating the
        // engine.
        let engine = engine;

        // TODO(albrow): Consider using progress tracker to count the number of
        // operations. Could be visualized as "feul" for your drone/robot that
        // will eventually run out if your script runs too long.
        // TODO(albrow): Manually overwrite certain common error messages to make
        // them more user-friendly.
        engine.run(script.as_str())?;

        let states = self.simulation.borrow().get_history();
        let positions = self.step_positions.borrow().to_vec();
        Ok((states, positions))
    }

    fn register_debugger(&self, engine: &mut Engine) {
        let step_positions = self.step_positions.clone();
        engine.register_debugger(
            |_| Dynamic::from(()),
            move |context, _event, node, _source, pos| {
                // println!("{:?}: {:?} at {}", event, node, pos);
                match node {
                    ASTNode::Stmt(Stmt::FnCall(fn_call_expr, ..)) => {
                        match fn_call_expr.name.as_str() {
                            "wait" => {
                                // log!("wait detected at line {}", pos.line().unwrap());
                                let duration =
                                    eval_call_args_as_int(context, fn_call_expr).unwrap();
                                for _ in 0..duration {
                                    step_positions.borrow_mut().push(pos);
                                }
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_right" => {
                                // log!("move_right detected at line {}", pos.line().unwrap());
                                let spaces = eval_call_args_as_int(context, fn_call_expr).unwrap();
                                for _ in 0..spaces {
                                    step_positions.borrow_mut().push(pos);
                                }
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_left" => {
                                // log!("move_left detected at line {}", pos.line().unwrap());
                                let spaces = eval_call_args_as_int(context, fn_call_expr).unwrap();
                                for _ in 0..spaces {
                                    step_positions.borrow_mut().push(pos);
                                }
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_up" => {
                                // log!("move_up detected at line {}", pos.line().unwrap());
                                let spaces = eval_call_args_as_int(context, fn_call_expr).unwrap();
                                for _ in 0..spaces {
                                    step_positions.borrow_mut().push(pos);
                                }
                                Ok(DebuggerCommand::StepInto)
                            }
                            "move_down" => {
                                // log!("move_down detected at line {}", pos.line().unwrap());
                                let spaces = eval_call_args_as_int(context, fn_call_expr).unwrap();
                                for _ in 0..spaces {
                                    step_positions.borrow_mut().push(pos);
                                }
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
        // For each function, we clone and borrow the simulation. This is
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
        engine.register_fn("my_position", move || {
            simulation.borrow().curr_state().player.pos
        });
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
        .register_type_with_name::<Pos>("Position")
        .register_get("x", Pos::get_x)
        .register_get("y", Pos::get_y);
}

#[cfg(test)]
mod test {
    // TODO(albrow): Unit test ScriptRunner.
}

fn eval_call_args_as_int(
    context: EvalContext,
    fn_call_expr: &Box<FnCallExpr>,
) -> Result<i64, Error> {
    if fn_call_expr.args.len() != 1 {
        return Err(Error::new(
            ErrorKind::Other,
            "Expected exactly one argument to function call",
        ));
    }
    let arg = fn_call_expr.args[0].clone();
    let arg_val = match arg.get_literal_value() {
        // Arg is a literal. Much easier to parse.
        Some(dyn_val) => dyn_val.as_int().unwrap(),
        _ => {
            // Arg is not a literal, evaluate it using the current context.
            // To do this, we need to first collect all the modules in the current
            // context into a single module. (The main thing we care about for our
            // usecase is user-defined functions inside the script.)
            let mut module = rhai::Module::new();
            for m in context.iter_namespaces() {
                module.combine(m.to_owned());
            }
            // With the module constructed, we can now evaluate the arg expression
            // inside it's own AST tree.
            let arg_ast = rhai::AST::new([rhai::Stmt::Expr(Box::new(arg))], module);
            let mut scope = context.scope().clone();
            let arg_val = context
                .engine()
                .eval_ast_with_scope::<i64>(&mut scope, &arg_ast);
            match arg_val {
                Ok(val) => val,
                Err(err) => {
                    return Err(Error::new(
                        ErrorKind::Other,
                        format!("Error evaluating argument: {}", err),
                    ))
                }
            }
        }
    };
    Ok(arg_val)
}
