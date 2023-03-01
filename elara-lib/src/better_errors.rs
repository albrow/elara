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

pub fn convert_err(
    avail_funcs: &Vec<&'static str>,
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
            if (token == ";") && (desc == "at end of line") {
                return BetterError {
                    message: String::from("Syntax Error: Missing semicolon ';' at end of line."),
                    line: pos.line(),
                    col: pos.position(),
                };
            }
            if (token == ";") && (desc == "to terminate this statement") {
                // Sometimes Rhai will give a missing semicolon error on the next line instead of
                // the line where the semicolon is actually missing. Check for this and then change
                // the line number if needed.
                let orig_line = pos.line().unwrap();
                let mut message = String::from(
                    "Syntax Error: Missing semicolon ';' after function call or other statement.",
                );
                let line = search_prev_lines(script.as_str(), orig_line);
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
        }
        EvalAltResult::ErrorFunctionNotFound(ref fn_sig, ref pos) => {
            let fn_name = fn_name_from_sig(fn_sig.as_str());
            if !avail_funcs.contains(&fn_name.as_str()) {
                // If the function is not available for this level, just return
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
                    1 => BetterError {
                        message: format!(
                            "Error: {} should have one {} as an input.",
                            builtin_fn.name, builtin_fn.arg_types[0]
                        ),
                        line: pos.line(),
                        col: pos.position(),
                    },
                    _ => BetterError {
                        message: format!(
                            "Error: Wrong inputs for {}. Should be ({}).",
                            builtin_fn.name,
                            builtin_fn.arg_types.join(", ")
                        ),
                        line: pos.line(),
                        col: pos.position(),
                    },
                };
            }
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
        static ref TEST_AVAIL_FUNCS: Vec<&'static str> = vec![
            "move_forward",
            "move_backward",
            "turn_left",
            "turn_right",
            "say",
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
        let err = convert_err(&TEST_AVAIL_FUNCS, script, Box::new(err));
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
        let err = convert_err(&TEST_AVAIL_FUNCS, script, Box::new(err));
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
        let err = convert_err(&TEST_AVAIL_FUNCS, script, Box::new(err));
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
        let err = convert_err(&TEST_AVAIL_FUNCS, script, Box::new(err));
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
        let err = convert_err(&TEST_AVAIL_FUNCS, script, Box::new(err));
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
        let err = convert_err(&TEST_AVAIL_FUNCS, script, Box::new(err));
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
        let err = convert_err(&TEST_AVAIL_FUNCS, script, Box::new(err));
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
