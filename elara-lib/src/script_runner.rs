use rhai::debugger::DebuggerCommand;
use rhai::{
    ASTNode, Dynamic, Engine, EvalAltResult, EvalContext, Expr, FnCallExpr, Position, Stmt,
};
use std::cell::RefCell;
use std::convert::TryInto;
use std::io::{Error, ErrorKind};
use std::rc::Rc;
use std::sync::mpsc;
use std::vec;

use crate::actors::{Action, MoveDirection, TurnDirection};
use crate::better_errors::{convert_err, BetterError};
use crate::constants::{
    BAD_INPUT_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL, ERR_NO_BUTTON, ERR_NO_DATA_POINT,
    ERR_SIMULATION_END,
};
use crate::levels::Outcome;
use crate::simulation::{
    get_adjacent_button, get_adjacent_point, Orientation, Pos, Simulation, State,
};

/// Responsible for running user scripts and coordinating communication
/// between the Rhai Engine and the Simulation.
pub struct ScriptRunner {
    simulation: Rc<RefCell<Simulation>>,
    /// Used to send actions from the script to the PlayerChannelActor.
    player_action_tx: Rc<RefCell<mpsc::Sender<Action>>>,
    /// Used for building up the trace of positions for each step in the simulation.
    pending_trace: Rc<RefCell<Vec<Vec<usize>>>>,
}

#[derive(Debug, Clone)]
pub struct ScriptResult {
    /// The state corresponding to each step in the simulation.
    pub states: Vec<State>,
    /// The line numbers corresponding to each step in the simulation. Similar
    /// to a stack trace, but we only track lines of code which cause the
    /// simulation to step forward. This is used to highlight active/running
    /// lines of code in the editor UI. Each step may be associated with
    /// multiple lines of code (e.g. in the event of a call to a user-defined
    /// function), which is why this is a vector of vectors. The last line number
    /// in each step corresponds to the *innermost* statement (i.e. the bottom
    /// of the call stack, typically the body of the function being called).
    pub trace: Vec<Vec<usize>>,
    pub outcome: Outcome,
    pub stats: ScriptStats,
    pub passes_challenge: bool,
}

impl ScriptRunner {
    pub fn new(
        simulation: Rc<RefCell<Simulation>>,
        player_action_tx: Rc<RefCell<mpsc::Sender<Action>>>,
    ) -> ScriptRunner {
        ScriptRunner {
            simulation,
            player_action_tx,
            // Start with empty line numbers for step 0. This ensures that
            // the trace aligns with simulation steps. Or in other words, at
            // step 0 there is not active line number.
            pending_trace: Rc::new(RefCell::new(vec![vec![]])),
        }
    }

    /// Runs the user script and returns the result or error.
    ///
    /// avail_funcs is the list of functions that are available to the user.
    /// Some levels have restrictions on which functions are available.
    pub fn run(
        &mut self,
        avail_funcs: &[String],
        disabled_funcs: &'static [&'static str],
        script: &str,
    ) -> Result<ScriptResult, BetterError> {
        // Create and configure the Rhai engine.
        let mut engine = Engine::new();
        set_engine_config(&mut engine);
        set_engine_safeguards(&mut engine);
        set_print_fn(&mut engine);
        self.register_debugger(&mut engine, avail_funcs);
        register_custom_types(&mut engine);
        self.register_player_funcs(&mut engine, avail_funcs);

        // Try compiling the AST first and check for lexer/parser errors.
        let ast = match engine.compile(script) {
            Err(parse_err) => {
                let alt_result = Box::new(EvalAltResult::ErrorParsing(*parse_err.0, parse_err.1));
                return Err(convert_err(
                    avail_funcs,
                    disabled_funcs,
                    script.to_string(),
                    alt_result,
                ));
            }
            Ok(ast) => ast,
        };

        // Next use a custom check for semicolons at the end of each line
        // (except for blocks or inside comments).
        match check_semicolons(script) {
            Ok(()) => {}
            Err(err) => {
                return Err(convert_err(
                    avail_funcs,
                    disabled_funcs,
                    script.to_string(),
                    err,
                ))
            }
        }

        // Reset pending_trace. We always start with an empty list for step 0 (i.e. no
        // active line numbers).
        self.pending_trace.borrow_mut().clear();
        self.pending_trace.borrow_mut().push(vec![]);

        // Make engine non-mutable now that we are done configuring it.
        // This is a safety measure to prevent scripts from mutating the
        // engine.
        let engine = engine;

        // If the AST looks good, try running the script.
        if let Err(err) = engine.run_ast(&ast) {
            match *err {
                EvalAltResult::ErrorRuntime(_, _) => {
                    if err.to_string().contains(ERR_SIMULATION_END) {
                        // Special case for when the simulation ends before the script
                        // finishes running. This is not actually an error, so we continue.
                    } else {
                        // Other runtime errors should be considered a failure.
                        // In this case we still return all the states and trace.
                        let outcome = Outcome::Failure(err.to_string());
                        let states = self.simulation.borrow().get_history();
                        let trace = self.pending_trace.borrow().to_vec();
                        let stats = compute_stats(&engine, script, &states);
                        return Ok(ScriptResult {
                            states,
                            trace,
                            outcome,
                            stats,
                            passes_challenge: false,
                        });
                    }
                }
                _ => {
                    // For all other kinds of errors, we return the error.
                    return Err(convert_err(
                        avail_funcs,
                        disabled_funcs,
                        script.to_string(),
                        err,
                    ));
                }
            }
        }

        let states = self.simulation.borrow().get_history();
        let positions = self.pending_trace.borrow().to_vec();
        let outcome = self.simulation.borrow().last_outcome();
        let stats = compute_stats(&engine, script, &states);

        // If the outcome is success, and the level has a challenge,
        // check if it was passed.
        let mut passes_challenge = false;
        if let Outcome::Success = outcome {
            let curr_level = self.simulation.borrow().curr_level();
            if curr_level.challenge().is_some() {
                passes_challenge = curr_level.check_challenge(&states, script, &stats);
            }
        }

        Ok(ScriptResult {
            states,
            trace: positions,
            outcome,
            stats,
            passes_challenge,
        })
    }

    fn register_debugger(&self, engine: &mut Engine, avail_funcs: &[String]) {
        let pending_trace = self.pending_trace.clone();
        let simulation = self.simulation.clone();
        let avail_funcs = avail_funcs.to_owned();
        // Note(albrow): register_debugger is not actually deprecated. The Rhai maintainers
        // have decided to use the "deprecated" attribute to indicate that the API is not
        // stable.
        #[allow(deprecated)]
        engine.register_debugger(
            |_engine, debugger| debugger,
            move |context, _event, node, _source, pos| {
                // log!("{:?}: {:?} at {}", _event, node, pos);
                match node {
                    ASTNode::Expr(Expr::FnCall(fn_call_expr, ..)) => {
                        // log!(
                        //     "Match on function call expression: {:?}",
                        //     fn_call_expr.name.as_str()
                        // );
                        Self::handle_debugger_function_call(
                            &avail_funcs,
                            pending_trace.clone(),
                            context,
                            pos,
                            fn_call_expr,
                        )
                    }
                    ASTNode::Stmt(Stmt::FnCall(fn_call_expr, ..)) => {
                        // log!(
                        //     "Match on function call statement: {:?}",
                        //     fn_call_expr.name.as_str()
                        // );
                        Self::handle_debugger_function_call(
                            &avail_funcs,
                            pending_trace.clone(),
                            context,
                            pos,
                            fn_call_expr,
                        )
                    }
                    _ => {
                        let last_outcome = simulation.borrow().last_outcome();
                        if last_outcome == Outcome::Continue || last_outcome == Outcome::NoObjective
                        {
                            Ok(DebuggerCommand::StepInto)
                        } else {
                            Err(ERR_SIMULATION_END.into())
                        }
                    }
                }
            },
        );
    }

    // The whole purpose of handling function calls in the debugger is to
    // track which line of code should currently be considered "active". In
    // practice, this is not as straightforward as it sounds. For example,
    // for function calls like move_right() we need to evaluate the argument
    // to determine how many steps the rover should move and detect the current
    // orientation to determine how many steps the rover should turn. This requires
    // hooking into the current EvalContext and evaluating some custom code/custom
    // AST at runtime.
    fn handle_debugger_function_call(
        avail_funcs: &[String],
        pending_trace: Rc<RefCell<Vec<Vec<usize>>>>,
        context: EvalContext,
        pos: Position,
        fn_call_expr: &FnCallExpr,
    ) -> Result<DebuggerCommand, Box<EvalAltResult>> {
        if !(avail_funcs.contains(&fn_call_expr.name.as_str().to_string())) {
            // If the function is not in the list of available functions, we
            // ignore it. Some levels may ask users to implement functions that
            // are later considered built-in.
            return Ok(DebuggerCommand::StepInto);
        }

        // Compute the full list of line numbers including the current line
        // number and any function calls from higher up in the call stack.
        let mut trace_lines = context
            .global_runtime_state()
            .debugger()
            .call_stack()
            .iter()
            .map(|stack| stack.pos.line().unwrap())
            .collect::<Vec<usize>>();
        let line = pos.line().unwrap();
        trace_lines.push(line);

        match fn_call_expr.name.as_str() {
            "wait" => {
                // The number of steps here depends on the argument. E.g. wait(3) means
                // that this line should be considered "active" for 3 steps.
                let duration = eval_call_args_as_int(&context, fn_call_expr).unwrap_or(0);
                for _ in 0..duration {
                    pending_trace.borrow_mut().push(trace_lines.clone());
                }
                Ok(DebuggerCommand::StepInto)
            }
            "turn_right" | "turn_left" => {
                pending_trace.borrow_mut().push(trace_lines.clone());
                Ok(DebuggerCommand::StepInto)
            }
            "move_forward" | "move_backward" => {
                // For move_forward and move_backward, the number of steps is just based
                // on the argument.
                let move_steps = eval_call_args_as_int(&context, fn_call_expr).unwrap_or(0);
                for _ in 0..move_steps {
                    pending_trace.borrow_mut().push(trace_lines.clone());
                }
                Ok(DebuggerCommand::StepInto)
            }
            "move_right" => {
                // For move_right and other directional move functions, the number of steps
                // is based on: (a) the number of spaces to move, and (b) the current
                // orientation of the rover.
                let move_steps = eval_call_args_as_int(&context, fn_call_expr).unwrap_or(0);
                let curr_orientation = eval_curr_orientation(&context).unwrap();
                let rotation_steps = match curr_orientation {
                    Orientation::Right => 0,
                    Orientation::Up => 1,
                    Orientation::Left => 2,
                    Orientation::Down => 1,
                };
                let total_steps = move_steps + rotation_steps;
                for _ in 0..total_steps {
                    pending_trace.borrow_mut().push(trace_lines.clone());
                }
                Ok(DebuggerCommand::StepInto)
            }
            "move_left" => {
                let move_steps = eval_call_args_as_int(&context, fn_call_expr).unwrap_or(0);
                let curr_orientation = eval_curr_orientation(&context).unwrap();
                let rotation_steps = match curr_orientation {
                    Orientation::Right => 2,
                    Orientation::Up => 1,
                    Orientation::Left => 0,
                    Orientation::Down => 1,
                };
                let total_steps = move_steps + rotation_steps;
                for _ in 0..total_steps {
                    pending_trace.borrow_mut().push(trace_lines.clone());
                }
                Ok(DebuggerCommand::StepInto)
            }
            "move_up" => {
                let move_steps = eval_call_args_as_int(&context, fn_call_expr).unwrap_or(0);
                let curr_orientation = eval_curr_orientation(&context).unwrap();
                let rotation_steps = match curr_orientation {
                    Orientation::Right => 1,
                    Orientation::Up => 0,
                    Orientation::Left => 1,
                    Orientation::Down => 2,
                };
                let total_steps = move_steps + rotation_steps;
                for _ in 0..total_steps {
                    pending_trace.borrow_mut().push(trace_lines.clone());
                }
                Ok(DebuggerCommand::StepInto)
            }
            "move_down" => {
                let move_steps = eval_call_args_as_int(&context, fn_call_expr).unwrap_or(0);
                let curr_orientation = eval_curr_orientation(&context).unwrap();
                let rotation_steps = match curr_orientation {
                    Orientation::Right => 1,
                    Orientation::Up => 2,
                    Orientation::Left => 1,
                    Orientation::Down => 0,
                };
                let total_steps = move_steps + rotation_steps;
                for _ in 0..total_steps {
                    pending_trace.borrow_mut().push(trace_lines.clone());
                }
                Ok(DebuggerCommand::StepInto)
            }
            "say" => {
                // The say function always has a duration of one step.
                pending_trace.borrow_mut().push(trace_lines.clone());
                Ok(DebuggerCommand::StepInto)
            }
            "read_data" => {
                // The read_data function always has a duration of one step.
                pending_trace.borrow_mut().push(trace_lines.clone());
                Ok(DebuggerCommand::StepInto)
            }
            "press_button" => {
                // The press_button function always has a duration of one step.
                pending_trace.borrow_mut().push(trace_lines.clone());
                Ok(DebuggerCommand::StepInto)
            }
            "pick_up" => {
                // The pick_up function always has a duration of one step.
                pending_trace.borrow_mut().push(trace_lines.clone());
                Ok(DebuggerCommand::StepInto)
            }
            "drop" => {
                // The drop function always has a duration of one step.
                pending_trace.borrow_mut().push(trace_lines.clone());
                Ok(DebuggerCommand::StepInto)
            }
            _ => Ok(DebuggerCommand::StepInto),
        }
    }

    /// Register functions for each action that can exist in a user script.
    /// Each function will simply send the corresponding action(s) through
    /// the channel.
    ///
    /// avail_funcs is the list of functions that are available to the user.
    /// Some levels have restrictions on which functions are available.
    fn register_player_funcs(&self, engine: &mut Engine, avail_funcs: &[String]) {
        // For each function, we clone and borrow some pointers (e.g. simulation and
        // player_action_tx). This is a workaround due to the fact that the Rhai engine
        // does not allow for mutable non-static references in handlers. See
        // https://rhai.rs/book/patterns/control.html for more context.
        //
        //
        // Note(albrow): If you add new functions here, don't forget to add them to
        // BUILTIN_FUNCTIONS in constants.rs.
        //
        if avail_funcs.contains(&"wait".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("wait", move |duration: i64| {
                for _ in 0..duration {
                    tx.borrow().send(Action::Wait).unwrap();
                    simulation.borrow_mut().step_forward();
                }
            });
        }
        if avail_funcs.contains(&"turn_right".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("turn_right", move || {
                tx.borrow()
                    .send(Action::Turn(TurnDirection::Right))
                    .unwrap();
                simulation.borrow_mut().step_forward();
            });
        }
        if avail_funcs.contains(&"turn_left".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("turn_left", move || {
                tx.borrow().send(Action::Turn(TurnDirection::Left)).unwrap();
                simulation.borrow_mut().step_forward();
            });
        }
        if avail_funcs.contains(&"move_forward".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("move_forward", move |spaces: i64| {
                // For move_forward and move_backward, the number of steps is
                // directly determined by the argument.
                for _ in 0..spaces {
                    tx.borrow()
                        .send(Action::Move(MoveDirection::Forward))
                        .unwrap();
                    simulation.borrow_mut().step_forward();
                }
            });
        }
        if avail_funcs.contains(&"move_backward".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("move_backward", move |spaces: i64| {
                for _ in 0..spaces {
                    tx.borrow()
                        .send(Action::Move(MoveDirection::Backward))
                        .unwrap();
                    simulation.borrow_mut().step_forward();
                }
            });
        }
        if avail_funcs.contains(&"move_right".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("move_right", move |spaces: i64| {
                // move_right (and other directional move functions) work by first
                // rotating the rover to correct orientation, and then moving
                // forward the given number of spaces.
                let mut sim = simulation.borrow_mut();
                match sim.curr_state().player.facing {
                    Orientation::Right => {}
                    Orientation::Up => {
                        tx.borrow()
                            .send(Action::Turn(TurnDirection::Right))
                            .unwrap();
                        sim.step_forward();
                    }
                    Orientation::Left => {
                        for _ in 0..2 {
                            tx.borrow()
                                .send(Action::Turn(TurnDirection::Right))
                                .unwrap();
                            sim.step_forward();
                        }
                    }
                    Orientation::Down => {
                        tx.borrow().send(Action::Turn(TurnDirection::Left)).unwrap();
                        sim.step_forward();
                    }
                }
                for _ in 0..spaces {
                    tx.borrow()
                        .send(Action::Move(MoveDirection::Forward))
                        .unwrap();
                    sim.step_forward();
                }
            });
        }
        if avail_funcs.contains(&"move_left".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("move_left", move |spaces: i64| {
                let mut sim = simulation.borrow_mut();
                match sim.curr_state().player.facing {
                    Orientation::Right => {
                        for _ in 0..2 {
                            tx.borrow().send(Action::Turn(TurnDirection::Left)).unwrap();
                            sim.step_forward();
                        }
                    }
                    Orientation::Up => {
                        tx.borrow().send(Action::Turn(TurnDirection::Left)).unwrap();
                        sim.step_forward();
                    }
                    Orientation::Left => {}
                    Orientation::Down => {
                        tx.borrow()
                            .send(Action::Turn(TurnDirection::Right))
                            .unwrap();
                        sim.step_forward();
                    }
                }
                for _ in 0..spaces {
                    tx.borrow()
                        .send(Action::Move(MoveDirection::Forward))
                        .unwrap();
                    sim.step_forward();
                }
            });
        }
        if avail_funcs.contains(&"move_up".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("move_up", move |spaces: i64| {
                let mut sim = simulation.borrow_mut();
                match sim.curr_state().player.facing {
                    Orientation::Right => {
                        tx.borrow().send(Action::Turn(TurnDirection::Left)).unwrap();
                        sim.step_forward();
                    }
                    Orientation::Up => {}
                    Orientation::Left => {
                        tx.borrow()
                            .send(Action::Turn(TurnDirection::Right))
                            .unwrap();
                        sim.step_forward();
                    }
                    Orientation::Down => {
                        for _ in 0..2 {
                            tx.borrow()
                                .send(Action::Turn(TurnDirection::Right))
                                .unwrap();
                            sim.step_forward();
                        }
                    }
                }
                for _ in 0..spaces {
                    tx.borrow()
                        .send(Action::Move(MoveDirection::Forward))
                        .unwrap();
                    sim.step_forward();
                }
            });
        }
        if avail_funcs.contains(&"move_down".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("move_down", move |spaces: i64| {
                let mut sim = simulation.borrow_mut();
                match sim.curr_state().player.facing {
                    Orientation::Right => {
                        tx.borrow()
                            .send(Action::Turn(TurnDirection::Right))
                            .unwrap();
                        sim.step_forward();
                    }
                    Orientation::Up => {
                        for _ in 0..2 {
                            tx.borrow()
                                .send(Action::Turn(TurnDirection::Right))
                                .unwrap();
                            sim.step_forward();
                        }
                    }
                    Orientation::Left => {
                        tx.borrow().send(Action::Turn(TurnDirection::Left)).unwrap();
                        sim.step_forward();
                    }
                    Orientation::Down => {}
                }
                for _ in 0..spaces {
                    tx.borrow()
                        .send(Action::Move(MoveDirection::Forward))
                        .unwrap();
                    sim.step_forward();
                }
            });
        }
        if avail_funcs.contains(&"get_position".to_string()) {
            // get_position returns the current position of the player as an array
            // of [x, y].
            let simulation = self.simulation.clone();
            engine.register_fn("get_position", move || -> Dynamic {
                let pos = simulation.borrow().curr_state().player.pos;
                rhai::Array::from(vec![
                    Dynamic::from(pos.x as i64),
                    Dynamic::from(pos.y as i64),
                ])
                .into()
            });
        }
        if avail_funcs.contains(&"get_orientation".to_string()) {
            // get_orientation returns the direction that the player is currently
            // facing as a string.
            let simulation = self.simulation.clone();
            engine.register_fn("get_orientation", move || -> Dynamic {
                let orientation = simulation.borrow().curr_state().player.facing;
                let orientation_str = match orientation {
                    Orientation::Up => "up",
                    Orientation::Down => "down",
                    Orientation::Left => "left",
                    Orientation::Right => "right",
                };
                Dynamic::from(orientation_str)
            });
        }
        if avail_funcs.contains(&"say".to_string()) {
            // say causes the rover to say (i.e. display in a speech bubble)
            // the given expression.
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("say", move |s: Dynamic| {
                let message = s.to_string();
                tx.borrow().send(Action::Say(message)).unwrap();
                simulation.borrow_mut().step_forward();
            });
        }
        if avail_funcs.contains(&"add".to_string()) {
            // adds two numbers together. Used for teaching about function outputs.
            // (Normally you would use the + operator instead.)
            engine.register_fn("add", |a: i64, b: i64| -> i64 { a + b });
        }
        if avail_funcs.contains(&"read_data".to_string()) {
            // read_data returns the data held by an adjacent data point.
            // If there is no data point adjacent to the player, it returns
            // an error.
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn(
                "read_data",
                move || -> Result<Dynamic, Box<EvalAltResult>> {
                    tx.borrow().send(Action::ReadData).unwrap();
                    simulation.borrow_mut().step_forward();

                    let state = simulation.borrow().curr_state();
                    let pos = &state.player.pos;
                    if let Some(point_index) = get_adjacent_point(&state, pos) {
                        let data = state.data_points[point_index].data.clone();
                        Ok(data.into())
                    } else {
                        // TODO(albrow): Change this to a G.R.O.V.E.R. err message.
                        Err(ERR_NO_DATA_POINT.into())
                    }
                },
            );
        }
        if avail_funcs.contains(&"press_button".to_string()) {
            // press_button presses an adjacent button. If there is no button
            // adjacent to the player, it returns an error.
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("press_button", move || -> Result<(), Box<EvalAltResult>> {
                let state = simulation.borrow().curr_state();
                let pos = &state.player.pos;
                if get_adjacent_button(&state, pos).is_some() {
                    tx.borrow().send(Action::PressButton).unwrap();
                    simulation.borrow_mut().step_forward();
                    Ok(())
                } else {
                    // TODO(albrow): Change this to a G.R.O.V.E.R. err message.
                    Err(ERR_NO_BUTTON.into())
                }
            });
        }
        if avail_funcs.contains(&"pick_up".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("pick_up", move || -> Result<(), Box<EvalAltResult>> {
                tx.borrow().send(Action::PickUp).unwrap();
                simulation.borrow_mut().step_forward();
                Ok(())
            });
        }
        if avail_funcs.contains(&"drop".to_string()) {
            let tx = self.player_action_tx.clone();
            let simulation = self.simulation.clone();
            engine.register_fn("drop", move || -> Result<(), Box<EvalAltResult>> {
                tx.borrow().send(Action::Drop).unwrap();
                simulation.borrow_mut().step_forward();
                Ok(())
            });
        }
        // Our debugger hook *always* needs a way to get the current orientation, so
        // we use this special function even it if the get_orientation function is not
        // available for the user.
        let simulation = self.simulation.clone();
        engine.register_fn("__get_orientation__", move || -> Dynamic {
            let orientation = simulation.borrow().curr_state().player.facing;
            let orientation_str = match orientation {
                Orientation::Up => "up",
                Orientation::Down => "down",
                Orientation::Left => "left",
                Orientation::Right => "right",
            };
            Dynamic::from(orientation_str)
        });
    }
}

#[derive(Debug, Clone)]
pub struct ScriptStats {
    // Length of the script in bytes.
    pub code_len: usize,
    // Amount of energy used by the rover.
    pub energy_used: u32,
    // Amount of time (i.e. number of steps) taken to execute the script.
    pub time_taken: u32,
}

fn compute_stats(engine: &Engine, script: &str, states: &[State]) -> ScriptStats {
    let energy_used = states.last().unwrap().player.total_energy_used;
    // Note that we subtract 1 from the length of states to make the number of
    // of "steps" more intuitive. Effectively, this means we don't count the initial
    // state as one of the "steps". As a result, you can count the number of actions
    // G.R.O.V.E.R. takes and it equals the number of steps.
    let time_taken = (states.len() - 1) as u32;
    // Note that we use compact_script to remove all comments and unnecessary whitespace
    // prior to computing the length.
    let code_len = engine.compact_script(script).unwrap().len();
    ScriptStats {
        code_len,
        energy_used,
        time_taken,
    }
}

// Note(albrow): This code is pretty brittle. We want to simplify the learning process by making
// semicolons required in places where Rhai considers them optional (e.g. like in the last statement
// of a block). It's difficult to do this right without building a full-blown tokenizer/parser. For
// now, we just aim to cover common cases. Unfortunately there are still some edge cases which result
// in false positives or false negatives.
fn check_semicolons(source: &str) -> Result<(), Box<EvalAltResult>> {
    let mut in_block_comment = false;
    let lines: Vec<&str> = source.lines().collect();
    'lines: for (i, line) in lines.iter().enumerate() {
        let trimmed = line.trim();
        if trimmed.is_empty()
            || trimmed.starts_with("//")
            || trimmed.ends_with('{')
            || trimmed.ends_with('}')
            || trimmed.ends_with("*/")
        {
            continue;
        }
        for (j, c) in trimmed.chars().enumerate() {
            if !in_block_comment
                && c == '/'
                && j + 1 < trimmed.len()
                && trimmed.chars().nth(j + 1) == Some('/')
            {
                continue 'lines;
            } else if c == '/' && j + 1 < trimmed.len() && trimmed.chars().nth(j + 1) == Some('*') {
                in_block_comment = true;
            } else if c == '*' && j + 1 < trimmed.len() && trimmed.chars().nth(j + 1) == Some('/') {
                in_block_comment = false;
            }
        }
        // Check if this line ends in an opening paren. This could be splitting a function's arguments
        // across multiple lines. Ideally, we would allow this, but we can't tell whether and where semicolons
        // would be required. For now, return an error explaining that arguments need to be on the same line.
        if trimmed.ends_with('(') {
            return Err(Box::new(EvalAltResult::ErrorParsing(
                rhai::ParseErrorType::BadInput(rhai::LexError::UnexpectedInput(String::from(
                    BAD_INPUT_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL,
                ))),
                rhai::Position::new(
                    (i + 1).try_into().unwrap(),
                    (line.len() - 1).try_into().unwrap(),
                ),
            )));
        }

        // Check if the next line is an opening bracket. This should be allowed.
        if let Some(next_line) = lines.get(i + 1) {
            let trimmed_next = next_line.trim();
            if trimmed_next.starts_with('{') {
                continue;
            }
        }
        if !in_block_comment && !trimmed.ends_with(';') {
            let line_num: u16 = (i + 1).try_into().unwrap();
            let col: u16 = (line.len() - 1).try_into().unwrap();
            return Err(Box::new(EvalAltResult::ErrorParsing(
                rhai::ParseErrorType::MissingToken(
                    String::from(';'),
                    String::from("at end of line"),
                ),
                rhai::Position::new(line_num, col),
            )));
        }
    }

    Ok(())
}

fn set_engine_config(engine: &mut Engine) {
    // Causes unknown identifiers to be a compile-time error.
    // See: https://rhai.rs/book/language/variables.html?highlight=strict#strict-variables-mode
    engine.set_strict_variables(true);
}

fn set_engine_safeguards(engine: &mut Engine) {
    // See https://rhai.rs/book/safety/
    engine.set_max_string_size(1_000);
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

fn eval_call_args_as_int(context: &EvalContext, fn_call_expr: &FnCallExpr) -> Result<i64, Error> {
    if fn_call_expr.args.len() != 1 {
        return Err(Error::new(
            ErrorKind::Other,
            "Expected exactly one argument to function call",
        ));
    }
    let arg = fn_call_expr.args[0].clone();
    let arg_val = match arg.get_literal_value() {
        // Arg is a literal. Much easier to parse.
        Some(dyn_val) => match dyn_val.as_int() {
            Ok(int_val) => int_val,
            Err(actual_type) => {
                return Err(Error::new(
                    ErrorKind::Other,
                    format!("Expected argument to be an integer but got {}", actual_type),
                ))
            }
        },
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

/// Returns the current direction that the rover is facing. Intended to be
/// used inside the debugger.
fn eval_curr_orientation(context: &EvalContext) -> Result<Orientation, Error> {
    let mut module = rhai::Module::new();
    for m in context.iter_namespaces() {
        module.combine(m.to_owned());
    }
    // With the module constructed, we can now evaluate th special
    // __get_orientation__() call inside the current scope.
    let mut scope = context.scope().clone();
    let orientation_val = context
        .engine()
        .eval_expression_with_scope::<String>(&mut scope, "__get_orientation__()");
    match orientation_val {
        Ok(dir) => match dir.as_str() {
            "up" => Ok(Orientation::Up),
            "down" => Ok(Orientation::Down),
            "left" => Ok(Orientation::Left),
            "right" => Ok(Orientation::Right),
            _ => Err(Error::new(
                ErrorKind::Other,
                format!("Unknown orientation: {}", dir),
            )),
        },
        Err(err) => Err(Error::new(
            ErrorKind::Other,
            format!("Error evaluating orientation: {}", err),
        )),
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::levels::SANDBOX_LEVEL_WITH_DATA_POINT;

    #[test]
    fn test_check_semicolons() {
        let source = r#"
            // This is a comment
            fn foo() {
                // This is a comment
                let a = 1;
                let b = 2; // This is an inline comment.
                let c = 3; /* This is a block comment */
                let /* this is an intrusive comment */ d = 4;
                /* 
                    This is a multiline comment.
                    It has more than one line.
                 */
            }
        "#;
        check_semicolons(source).unwrap();

        let source = r#"
            // This is a comment
            fn foo() {
                // This is a comment
                let a = 1
                let b = 2; // This is an inline comment.
                let c = 3; /* This is a block comment */
                let /* this is an intrusive comment */ d = 4;
                /* 
                    This is a multiline comment.
                    It has more than one line.
                */
            }
        "#;
        assert!(check_semicolons(source).is_err());

        // Should not be a missing semicolon error if a bracket is on
        // the next line. This is a regression test for
        // https://github.com/albrow/elara/issues/67
        let source = r"
            loop
            {
                move_forward(1);
            }
            if true
            {
                move_forward(1);
            }
            else
            {
                move_forward(1);
            }
            while true
            {
                move_forward(1);
            }
        ";
        check_semicolons(source).unwrap();

        // TODO(albrow): Uncomment this test once we handle the edge case.
        // let source = r#"
        //     // This is a comment
        //     fn foo() {
        //         // This is a comment
        //         let a = 1;
        //         let b = 2 // This is an inline comment.
        //         let c = 3; /* This is a block comment */
        //         let /* this is an intrusive comment */ d = 4;
        //         /*
        //             This is a multiline comment.
        //             It has more than one line.
        //         */
        //     }
        // "#;
        // assert!(check_semicolons(source).is_err());

        // TODO(albrow): Uncomment this test once we handle the edge case.
        // let source = r#"
        //     // This is a comment
        //     fn foo() {
        //         // This is a comment
        //         let a = 1;
        //         let b = 2; // This is an inline comment.
        //         let c = 3 /* This is a block comment */
        //         let /* this is an intrusive comment */ d = 4;
        //         /*
        //             This is a multiline comment.
        //             It has more than one line.
        //         */
        //     }
        // "#;
        // assert!(check_semicolons(source).is_err());

        let source = r#"
        // This is a comment
        fn foo() {
            // This is a comment
            let a = 1;
            let b = 2; // This is an inline comment.
            let c = 3; /* This is a block comment */
            let /* this is an intrusive comment */ d = 4
            /* 
                This is a multiline comment.
                It has more than one line.
            */
        }
    "#;
        assert!(check_semicolons(source).is_err());
    }

    #[test]
    fn test_unexpected_line_break_in_function_call() {
        let script = r#"
            fn foo() {
                move_forward(
                    1
                );
            }"#;
        let result = check_semicolons(script);
        assert!(result.is_err());
        let err = result.unwrap_err();
        assert_eq!(
            err.to_string(),
            "Syntax error: Unexpected 'line break in function call' (line 3, position 28)"
        );
    }

    /// Asserts that result is not a failure and then checks the each
    /// line number in results.trace. Note that we only check the line number,
    /// not the column number.
    fn assert_trace_eq(result: &ScriptResult, expected: Vec<Vec<usize>>) {
        assert!(result.outcome == Outcome::NoObjective || result.outcome == Outcome::Continue);
        assert_eq!(result.trace, expected);
    }

    /// A test for functions which always have a constant number of steps (e.g.
    /// turn_right and say).
    #[test]
    fn test_trace_for_zero_step_functions() {
        let mut game = crate::Game::new();

        let script = r#"
            get_orientation();
        "#;
        let result = game
            .run_player_script_internal(
                SANDBOX_LEVEL_WITH_DATA_POINT,
                &vec!["get_orientation".to_string()],
                script.to_string(),
            )
            .unwrap();
        assert_trace_eq(&result, vec![vec![]]);
    }

    /// A test for functions which always have a constant number of steps (e.g.
    /// turn_right and say).
    #[test]
    fn test_trace_for_constant_step_functions() {
        let mut game = crate::Game::new();

        let script = r#"
            turn_left();
            turn_right();
            say("hello");
            read_data();
        "#;
        let result = game
            .run_player_script_internal(
                SANDBOX_LEVEL_WITH_DATA_POINT,
                &vec![
                    "turn_left".to_string(),
                    "turn_right".to_string(),
                    "say".to_string(),
                    "read_data".to_string(),
                ],
                script.to_string(),
            )
            .unwrap();
        assert_trace_eq(&result, vec![vec![], vec![2], vec![3], vec![4], vec![5]]);
    }

    /// A test for functions with a variable number of steps (e.g.
    /// move_forward and wait).
    #[test]
    fn test_trace_for_variable_step_functions() {
        let mut game = crate::Game::new();

        let script = r#"
            move_forward(2);
            move_backward(3);
        "#;
        let result = game
            .run_player_script_internal(
                SANDBOX_LEVEL_WITH_DATA_POINT,
                &vec!["move_forward".to_string(), "move_backward".to_string()],
                script.to_string(),
            )
            .unwrap();
        assert_trace_eq(
            &result,
            vec![vec![], vec![2], vec![2], vec![3], vec![3], vec![3]],
        );
    }

    /// A test for user-defined function calls. In this case we want each
    /// step to be associated with *both* the line number of the call and
    /// the line number in the body of the function.
    #[test]
    fn test_trace_for_function_calls() {
        let mut game = crate::Game::new();

        let script = r#"
            fn foo() {
                move_forward(2);
                say("hello");
            }
            foo();
            foo();
        "#;
        let result = game
            .run_player_script_internal(
                SANDBOX_LEVEL_WITH_DATA_POINT,
                &vec!["move_forward".to_string(), "say".to_string()],
                script.to_string(),
            )
            .unwrap();
        assert_trace_eq(
            &result,
            vec![
                vec![],
                vec![6, 3],
                vec![6, 3],
                vec![6, 4],
                vec![7, 3],
                vec![7, 3],
                vec![7, 4],
            ],
        );
    }

    /// A test for nested user-defined function calls, i.e. with a greater
    /// call stack depth.
    #[test]
    fn test_trace_for_nested_function_calls() {
        let mut game = crate::Game::new();

        let script = r#"
            fn bar() {
                move_forward(2);
                say("hello");
            }
            fn foo() {
                bar();
            }
            foo();
        "#;
        let result = game
            .run_player_script_internal(
                SANDBOX_LEVEL_WITH_DATA_POINT,
                &vec!["move_forward".to_string(), "say".to_string()],
                script.to_string(),
            )
            .unwrap();
        assert_trace_eq(
            &result,
            vec![vec![], vec![9, 7, 3], vec![9, 7, 3], vec![9, 7, 4]],
        );
    }
}
