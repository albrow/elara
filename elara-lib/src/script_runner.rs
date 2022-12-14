use rand::Rng;
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

use crate::actors::{Action, Direction};
use crate::constants::{ERR_NO_DATA_TERMINAL, ERR_SIMULATION_END};
use crate::levels::Outcome;
use crate::simulation::{get_adjacent_terminal, Pos, Simulation, State};

/// Responsible for running user scripts and coordinating communication
/// between the Rhai Engine and the Simulation.
pub struct ScriptRunner {
    simulation: Rc<RefCell<Simulation>>,
    /// Used to send actions from the script to the PlayerChannelActor.
    player_action_tx: Rc<RefCell<mpsc::Sender<Action>>>,
    /// Tracks which lines of code in the user script cause the simulation to
    /// step forward. This is used to highlight active/running lines of code in
    /// the editor UI.
    step_positions: Rc<RefCell<Vec<Position>>>,
}

pub struct ScriptResult {
    pub states: Vec<State>,
    pub positions: Vec<Position>,
    pub outcome: Outcome,
}

impl ScriptRunner {
    pub fn new(
        simulation: Rc<RefCell<Simulation>>,
        player_action_tx: Rc<RefCell<mpsc::Sender<Action>>>,
    ) -> ScriptRunner {
        ScriptRunner {
            simulation,
            player_action_tx,
            // Start with NONE position for step 0. This ensures that
            // the positions align with simulation steps.
            step_positions: Rc::new(RefCell::new(vec![Position::NONE])),
        }
    }

    pub fn run(&mut self, script: &str) -> Result<ScriptResult, Box<EvalAltResult>> {
        // First use a custom check for semicolons at the end of each line
        // (except for blocks or inside comments).
        check_semicolons(script)?;

        // Create and configure the Rhai engine.
        let mut engine = Engine::new();
        set_engine_config(&mut engine);
        set_engine_safeguards(&mut engine);
        set_print_fn(&mut engine);
        self.register_debugger(&mut engine);
        register_custom_types(&mut engine);
        self.register_player_funcs(&mut engine);

        // Reset step_positions.
        self.step_positions.borrow_mut().clear();
        self.step_positions.borrow_mut().push(Position::NONE);

        // Make engine non-mutable now that we are done configuring it.
        // This is a safety measure to prevent scripts from mutating the
        // engine.
        let engine = engine;

        // Try compiling the AST first and check for lexer/parser errors.
        let ast = match engine.compile(script) {
            Err(parse_err) => {
                return Err(Box::new(EvalAltResult::ErrorParsing(
                    *parse_err.0,
                    parse_err.1,
                )));
            }
            Ok(ast) => ast,
        };

        // If the AST looks good, try running the script.
        //
        // TODO(albrow): Manually overwrite certain common error messages to make
        // them more user-friendly.
        match engine.run_ast(&ast) {
            Err(err) => {
                match *err {
                    EvalAltResult::ErrorRuntime(_, _)
                        if err.to_string().contains(ERR_SIMULATION_END) =>
                    {
                        // Special case for when the simulation ends before the script
                        // finishes running. This is not actually an error, so we continue.
                    }
                    _ => {
                        // For all other kinds of errors, we return the error.
                        return Err(err);
                    }
                }
            }
            _ => (),
        };

        let states = self.simulation.borrow().get_history();
        let positions = self.step_positions.borrow().to_vec();
        let outcome = self.simulation.borrow().last_outcome();
        Ok(ScriptResult {
            states,
            positions,
            outcome,
        })
    }

    fn register_debugger(&self, engine: &mut Engine) {
        let step_positions = self.step_positions.clone();
        let simulation = self.simulation.clone();
        // Note(albrow): register_debugger is not actually deprecated. The Rhai maintainers
        // have decided to use the "deprecated" attribute to indicate that the API is not
        // stable.
        #[allow(deprecated)]
        engine.register_debugger(
            |_| Dynamic::from(()),
            move |context, _event, node, _source, pos| {
                // log!("{:?}: {:?} at {}", _event, node, pos);
                match node {
                    ASTNode::Expr(Expr::FnCall(fn_call_expr, ..)) => {
                        // log!(
                        //     "Match on function call expression: {:?}",
                        //     fn_call_expr.name.as_str()
                        // );
                        Self::handle_debugger_function_call(
                            step_positions.clone(),
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
                            step_positions.clone(),
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

    fn handle_debugger_function_call(
        step_positions: Rc<RefCell<Vec<Position>>>,
        context: EvalContext,
        pos: Position,
        fn_call_expr: &Box<FnCallExpr>,
    ) -> Result<DebuggerCommand, Box<EvalAltResult>> {
        match fn_call_expr.name.as_str() {
            "wait" => {
                // For wait (and other functions like move_right, move_left),
                // we need to parse the argument to determine how many steps
                // this position should be considered "active".
                let duration = eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                for _ in 0..duration {
                    step_positions.borrow_mut().push(pos);
                }
                Ok(DebuggerCommand::StepInto)
            }
            "move_right" => {
                let spaces = eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                for _ in 0..spaces {
                    step_positions.borrow_mut().push(pos);
                }
                Ok(DebuggerCommand::StepInto)
            }
            "move_left" => {
                let spaces = eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                for _ in 0..spaces {
                    step_positions.borrow_mut().push(pos);
                }
                Ok(DebuggerCommand::StepInto)
            }
            "move_up" => {
                let spaces = eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                for _ in 0..spaces {
                    step_positions.borrow_mut().push(pos);
                }
                Ok(DebuggerCommand::StepInto)
            }
            "move_down" => {
                let spaces = eval_call_args_as_int(context, fn_call_expr).unwrap_or(0);
                for _ in 0..spaces {
                    step_positions.borrow_mut().push(pos);
                }
                Ok(DebuggerCommand::StepInto)
            }
            "say" => {
                // The say function always has a duration of one step.
                step_positions.borrow_mut().push(pos);
                Ok(DebuggerCommand::StepInto)
            }
            "read_data" => {
                // The read_data function always has a duration of one step.
                step_positions.borrow_mut().push(pos);
                Ok(DebuggerCommand::StepInto)
            }
            _ => Ok(DebuggerCommand::StepInto),
        }
    }

    /// Register functions for each action that can exist in a user script.
    /// Each function will simply send the corresponding action(s) through
    /// the channel.
    fn register_player_funcs(&self, engine: &mut Engine) {
        // For each function, we clone and borrow some pointers (e.g. simulation and
        // player_action_tx). This is a workaround due to the fact that the Rhai engine
        // does not allow for mutable non-static references in handlers. See
        // https://rhai.rs/book/patterns/control.html for more context.
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("wait", move |duration: i64| {
            for _ in 0..duration {
                tx.borrow().send(Action::Wait).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("move_right", move |spaces: i64| {
            for _ in 0..spaces {
                tx.borrow().send(Action::Move(Direction::Right)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("move_left", move |spaces: i64| {
            for _ in 0..spaces {
                tx.borrow().send(Action::Move(Direction::Left)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("move_up", move |spaces: i64| {
            for _ in 0..spaces {
                tx.borrow().send(Action::Move(Direction::Up)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("move_down", move |spaces: i64| {
            for _ in 0..spaces {
                tx.borrow().send(Action::Move(Direction::Down)).unwrap();
                simulation.borrow_mut().step_forward();
            }
        });
        // get_pos returns the current position of the player as an array
        // of [x, y].
        let simulation = self.simulation.clone();
        engine.register_fn("get_pos", move || -> Dynamic {
            let pos = simulation.borrow().curr_state().player.pos;
            rhai::Array::from(vec![
                Dynamic::from(pos.x as i64),
                Dynamic::from(pos.y as i64),
            ])
            .into()
        });
        // say causes the rover to say (i.e. display in a speech bubble)
        // the given expression.
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_fn("say", move |s: Dynamic| {
            let message = format!("{}", s);
            tx.borrow().send(Action::Say(message)).unwrap();
            simulation.borrow_mut().step_forward();
        });
        // random returns a random number between 1 and 100.
        engine.register_fn("random", || -> i64 {
            let mut rng = rand::thread_rng();
            rng.gen_range(1..=100)
        });
        // read_data returns the data held by an adjacent data terminal.
        // If there is no data terminal adjacent to the player, it returns
        // an error.
        let tx = self.player_action_tx.clone();
        let simulation = self.simulation.clone();
        engine.register_result_fn(
            "read_data",
            move || -> Result<Dynamic, Box<EvalAltResult>> {
                tx.borrow().send(Action::ReadData).unwrap();
                simulation.borrow_mut().step_forward();

                let state = simulation.borrow().curr_state();
                let pos = &state.player.pos;
                if let Some(terminal_index) = get_adjacent_terminal(&state, pos) {
                    let data = state.data_terminals[terminal_index].data.clone();
                    Ok(Dynamic::from(data))
                } else {
                    // TODO(albrow): Can we determine the line number for the error message?
                    Err(ERR_NO_DATA_TERMINAL.into())
                }
            },
        );
    }
}

fn check_semicolons(source: &str) -> Result<(), Box<EvalAltResult>> {
    let mut in_block_comment = false;
    let lines: Vec<&str> = source.lines().collect();
    'lines: for (i, line) in lines.iter().enumerate() {
        let trimmed = line.trim();
        if trimmed == "" {
            continue;
        } else if trimmed.starts_with("//") {
            continue;
        } else if trimmed.ends_with("{") || trimmed.ends_with("}") {
            continue;
        } else if trimmed.ends_with("*/") {
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
        if !in_block_comment && !trimmed.ends_with(';') {
            let line_num: u16 = (i + 1).try_into().unwrap();
            let col: u16 = (line.len() - 1).try_into().unwrap();
            return Err(Box::new(EvalAltResult::ErrorParsing(
                rhai::ParseErrorType::MissingToken(
                    String::from(";"),
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

#[cfg(test)]
mod test {
    use super::*;

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
}
