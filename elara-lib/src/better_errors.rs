use std::collections::HashMap;

use regex::Regex;
use rhai::EvalAltResult;

use crate::constants::BUILTIN_FUNCTIONS;

#[derive(Debug, PartialEq)]
pub struct BetterError {
    pub message: String,
    pub line: Option<usize>,
    pub col: Option<usize>,
}

impl std::fmt::Display for BetterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

/// Trim the message to not include position information.
///
/// Example:
///
/// ```
///    let trimmed = trim_message("Function not found: move_down () (line 5, position 1)");
///    assert_eq!(trimmed, "Function not found: move_down ()");
/// ```
fn trim_message(message: &str) -> String {
    let re = Regex::new(r" \(line \d+, position \d+\)$").unwrap();
    re.replace(message, "").to_string()
}

/// Get just the name of a Rhai function from its full signature.
///
/// Example:
///
/// ```
///    let name = fn_name_from_sig("move_down (i64, i64)");
///    assert_eq!(name, "move_down");
/// ```
fn fn_name_from_sig(fn_signature: &str) -> String {
    let re = Regex::new(r"\(.*\)").unwrap();
    re.replace(fn_signature, "").trim().to_string()
}

/// Searches previous lines in the script to see if there is a better
/// place to put a missing semicolon error.
pub fn search_prev_lines(script: &str, start_line: usize) -> usize {
    let mut line = start_line;
    while line >= 2 {
        let prev_line = script.lines().nth(line - 2).unwrap();
        if prev_line.trim().is_empty()
            || prev_line.contains("//")
            || prev_line.trim().ends_with("}")
            || prev_line.trim().ends_with("{")
        {
            // If the previous line is empty, is a comment, or is the start/end
            // of a block, keep searching backwards.
            line = line - 1;
            continue;
        }
        if !prev_line.ends_with(';') {
            // If we found a line that looks like it should end with a semicolon but
            // it doesn't, move the error message to that line.
            return line - 1;
        }
        // Otherwise, just use the original line.
        return start_line;
    }

    // Otherwise, just use the original line.
    return start_line;
}

// TODO(albrow):
//
//  - Handle functions which are not unlocked yet.
//  - Handle functions which are unlocked but temporarily disabled.
//
fn convert_func_not_found_err(
    avail_funcs: &Vec<String>,
    fn_sig: &str,
    pos: &rhai::Position,
) -> BetterError {
    let fn_name = fn_name_from_sig(fn_sig);
    if !avail_funcs.contains(&fn_name) {
        // If the function is not unlocked yet, just return
        // a "function not found" error.
        return BetterError {
            message: format!("Error: Function not found: {}", fn_name),
            line: pos.line(),
            col: pos.position(),
        };
    }

    // If the function is a builtin function, we can give a more helpful error message.
    // We know exactly how many arguments and of what type the function expects.
    if let Some(builtin_fn) = BUILTIN_FUNCTIONS.get(fn_name.as_str()) {
        return match builtin_fn.arg_types.len() {
            0 => BetterError {
                message: format!("Error: {} should not have any inputs.", builtin_fn.name),
                line: pos.line(),
                col: pos.position(),
            },
            1 => {
                if builtin_fn.arg_types[0] == "any" {
                    BetterError {
                        message: format!(
                            "Error: {} should have one input of any type.",
                            builtin_fn.name
                        ),
                        line: pos.line(),
                        col: pos.position(),
                    }
                } else {
                    BetterError {
                        message: format!(
                            "Error: {} should have one {} as an input.",
                            builtin_fn.name, builtin_fn.arg_types[0]
                        ),
                        line: pos.line(),
                        col: pos.position(),
                    }
                }
            }
            _ => BetterError {
                message: format!(
                    "Error: Wrong inputs for {}. Should have {} inputs ({}).",
                    builtin_fn.name,
                    builtin_fn.arg_types.len(),
                    builtin_fn.arg_types.join(", ")
                ),
                line: pos.line(),
                col: pos.position(),
            },
        };
    }

    // In this case, just return a generic "function not found" error.
    BetterError {
        message: format!("Error: Function not found: {}", fn_name),
        line: pos.line(),
        col: pos.position(),
    }
}

/// Returns true if the script contains an extra set of parentheses on the line
/// where the error occurred.
fn is_extra_parentheses_set(script: &str, err_pos: &rhai::Position) -> bool {
    if let Some(line_number) = err_pos.line() {
        let line = script.lines().nth(line_number - 1).unwrap();
        if line.contains(")()") || line.contains("()(") {
            return true;
        }
    }
    false
}

/// Returns true if the script contains an extra closing parentheses on the line
/// where the error occurred.
fn is_extra_closing_parentheses(script: &str, err_pos: &rhai::Position) -> bool {
    if let Some(line_number) = err_pos.line() {
        let line = script.lines().nth(line_number - 1).unwrap();
        // Count the number of open and closed parentheses on the line.
        let mut open_parens = 0;
        let mut closed_parens = 0;
        for c in line.chars() {
            if c == '(' {
                open_parens += 1;
            }
            if c == ')' {
                closed_parens += 1;
            }
            if closed_parens > open_parens {
                return true;
            }
        }
    }
    false
}

fn convert_missing_semicolon_error(script: &str, desc: &str, pos: &rhai::Position) -> BetterError {
    if desc == "at end of line" {
        return BetterError {
            message: String::from("Syntax Error: Missing semicolon ';' at end of line."),
            line: pos.line(),
            col: pos.position(),
        };
    }
    if desc == "to terminate this statement" {
        // Sometimes the Rhai parser spits out a missing semicolon error when the real culprit
        // is extra parentheses. (E.g. `turn_left()()` instead of `turn_left()`). Check if this
        // is the case.
        if is_extra_parentheses_set(script, pos) {
            return BetterError {
                message: String::from("Syntax Error: Unexpected extra parentheses '()'."),
                line: pos.line(),
                col: pos.position(),
            };
        } else if is_extra_closing_parentheses(script, pos) {
            return BetterError {
                message: String::from("Syntax Error: Unexpected extra closing parentheses ')'."),
                line: pos.line(),
                col: pos.position(),
            };
        }

        // Sometimes Rhai will give a missing semicolon error on the next line instead of
        // the line where the semicolon is actually missing. Check for this and then change
        // the line number if needed.
        let orig_line = pos.line().unwrap();
        let mut message = String::from(
            "Syntax Error: Missing semicolon ';' after function call or other statement.",
        );
        let line = search_prev_lines(script, orig_line);
        if line != orig_line {
            // If we found a better line to put the error message on, we should
            // also change the message for the sake of clarity.
            message = String::from("Syntax Error: Missing semicolon ';' at end of line.");
        }

        return BetterError {
            message: message,
            line: Some(line),
            col: pos.position(),
        };
    }

    // In all other cases, just return a generic missing semicolon error.
    BetterError {
        message: String::from("Syntax Error: Missing semicolon ';' at end of line."),
        line: pos.line(),
        col: pos.position(),
    }
}

lazy_static! {
    /// A map of common keyword typos to helpful hints.
    static ref KEYWORD_HINTS: HashMap<&'static str, &'static str> = {
        let mut m: HashMap<&'static str, &'static str> = HashMap::new();
        m.insert("Loop", "Did you mean loop with a lowercase 'l'?");
        m.insert("Let", "Did you mean let with a lowercase 'l'?");
        m.insert("If", "Did you mean if with a lowercase 'i'?");
        m
    };
}

// TODO(albrow):
//
//  - Handle functions which are not unlocked yet.
//  - Handle functions which are unlocked but temporarily disabled.
//
fn convert_var_not_found_error(
    avail_funcs: &Vec<String>,
    var_name: &str,
    pos: &rhai::Position,
) -> BetterError {
    if KEYWORD_HINTS.contains_key(var_name) {
        return BetterError {
            message: format!(
                r#"Error: Variable not found: {}. (Hint: {})"#,
                var_name, KEYWORD_HINTS[var_name]
            ),
            line: pos.line(),
            col: pos.position(),
        };
    } else if avail_funcs.contains(&var_name.to_string()) {
        return BetterError {
            message: format!(
                r#"Error: Variable not found: {}. (Hint: If you meant to call a function, make sure you include parentheses after the function name.)"#,
                var_name,
            ),
            line: pos.line(),
            col: pos.position(),
        };
    }

    BetterError {
        message: format!("Error: Variable not found: {}", var_name),
        line: pos.line(),
        col: pos.position(),
    }
}

// TODO(albrow):
//
//  - Handle functions which are not unlocked yet.
//  - Handle functions which are unlocked but temporarily disabled.
//
pub fn convert_err(
    avail_funcs: &Vec<String>,
    script: String,
    err: Box<EvalAltResult>,
) -> BetterError {
    // log!("{:?}", err);
    match *err {
        EvalAltResult::ErrorTooManyOperations(ref pos) => {
            return BetterError {
                message: String::from("Error: Possible infinite loop detected."),
                line: pos.line(),
                col: pos.position(),
            };
        }
        EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(ref token, ref desc),
            ref pos,
        ) => {
            if token == ";" {
                return convert_missing_semicolon_error(script.as_str(), desc, pos);
            }
        }
        EvalAltResult::ErrorFunctionNotFound(ref fn_sig, ref pos) => {
            return convert_func_not_found_err(avail_funcs, fn_sig, pos);
        }
        EvalAltResult::ErrorVariableNotFound(ref var_name, ref pos) => {
            return convert_var_not_found_error(avail_funcs, var_name, pos);
        }
        EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::VariableUndefined(ref var_name),
            ref pos,
        ) => {
            return convert_var_not_found_error(avail_funcs, var_name, pos);
        }
        EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::BadInput(rhai::LexError::UnterminatedString),
            ref pos,
        ) => {
            return BetterError {
                message: String::from("Error: String is missing a quotation mark at the end."),
                line: pos.line(),
                col: pos.position(),
            };
        }
        _ => {}
    }

    log!("Error: {}", err);
    let message = trim_message(err.to_string().as_str()).to_string();
    let line = err.position().line();
    let col = err.position().position();
    BetterError { message, line, col }
}

#[cfg(test)]
mod tests {
    use super::*;

    lazy_static! {
        static ref TEST_UNLOCKED_FUNCS: Vec<String> = vec![
            "move_forward".to_string(),
            "move_backward".to_string(),
            "turn_left".to_string(),
            "turn_right".to_string(),
            "say".to_string(),
        ];
    }

    #[test]
    fn test_trim_message() {
        assert_eq!(
            trim_message("Function not found: move_down () (line 5, position 1)"),
            "Function not found: move_down ()"
        );
        assert_eq!(
            trim_message("Syntax error: Undefined variable: asdpofij (line 5, position 1)"),
            "Syntax error: Undefined variable: asdpofij"
        );
    }

    #[test]
    fn test_convert_err_semicolon() {
        let script = String::from(
            r"move_forward(1);
            move_forward(1);
            move_forward(1);
            move_backward(1)",
        );
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(String::from(";"), String::from("at end of line")),
            rhai::Position::new(4, 21),
        );
        let err = convert_err(&TEST_UNLOCKED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from("Syntax Error: Missing semicolon ';' at end of line."),
                line: Some(4),
                col: Some(21),
            }
        );
    }

    #[test]
    fn test_convert_err_semicolon_next_line() {
        // This is a case where we should change the error message to refer to
        // the line where the semicolon is actually missing.
        let script = String::from(
            r"move_forward(1);
            move_forward(1);
            move_forward(1)
            move_backward(1);",
        );
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(
                String::from(";"),
                String::from("to terminate this statement"),
            ),
            rhai::Position::new(4, 13),
        );
        let err = convert_err(&TEST_UNLOCKED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from("Syntax Error: Missing semicolon ';' at end of line."),
                line: Some(3),
                col: Some(13),
            }
        );

        // This is a case where we should *not* change the line of the error message.
        let script = String::from(
            r"move_forward(1);
            move_forward(1);
            move_forward(1) move_backward(1);",
        );
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(
                String::from(";"),
                String::from("to terminate this statement"),
            ),
            rhai::Position::new(3, 26),
        );
        let err = convert_err(&TEST_UNLOCKED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Syntax Error: Missing semicolon ';' after function call or other statement."
                ),
                line: Some(3),
                col: Some(26),
            }
        );

        // This is another case where we should *not* change the line of the error message.
        // The preceding line is a comment, which is not required to end in a semicolon.
        let script = String::from(
            r"move_forward(1);
            move_backward(1);
            turn_left();
            // This is a comment.
            move_forward(1)",
        );
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(
                String::from(";"),
                String::from("to terminate this statement"),
            ),
            rhai::Position::new(5, 13),
        );
        let err = convert_err(&TEST_UNLOCKED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Syntax Error: Missing semicolon ';' after function call or other statement."
                ),
                line: Some(5),
                col: Some(13),
            }
        );

        // The preceding line is the start of a block, which is *not* required to end in
        // a semicolon.
        let script = String::from(
            r"if true {
                move_forward(1)
            }",
        );
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(
                String::from(";"),
                String::from("to terminate this statement"),
            ),
            rhai::Position::new(2, 15),
        );
        let err = convert_err(&TEST_UNLOCKED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Syntax Error: Missing semicolon ';' after function call or other statement."
                ),
                line: Some(2),
                col: Some(15),
            }
        );

        // The preceding line is the end of a block, which is *not* required to end in
        // a semicolon.
        let script = String::from(
            r"if true {
            }
            move_forward(1)",
        );
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(
                String::from(";"),
                String::from("to terminate this statement"),
            ),
            rhai::Position::new(3, 15),
        );
        let err = convert_err(&TEST_UNLOCKED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Syntax Error: Missing semicolon ';' after function call or other statement."
                ),
                line: Some(3),
                col: Some(15),
            }
        );

        // Test scanning backwards more than one line.
        let script = String::from(
            r"move_backward(1)

            // This is a comment
            if true {
              move_forward(1);
            }",
        );
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(
                String::from(";"),
                String::from("to terminate this statement"),
            ),
            rhai::Position::new(4, 1),
        );
        let err = convert_err(&TEST_UNLOCKED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from("Syntax Error: Missing semicolon ';' at end of line."),
                line: Some(1),
                col: Some(1),
            }
        );
    }

    #[test]
    fn test_fn_name_from_sig() {
        assert_eq!(fn_name_from_sig("move_down (i64, i64)"), "move_down");
        assert_eq!(fn_name_from_sig("move_down ()"), "move_down");
    }
}
