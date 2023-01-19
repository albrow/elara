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
    let re = Regex::new(r" \(.+\)$").unwrap();
    re.replace(fn_signature, "").trim().to_string()
}

pub fn convert_err(err: Box<EvalAltResult>) -> BetterError {
    match *err {
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
        }
        EvalAltResult::ErrorFunctionNotFound(ref fn_sig, ref pos) => {
            let fn_name = fn_name_from_sig(fn_sig.as_str());

            // If the function is a builtin function, we can give a more helpful error message.
            // We know exactly how many arguments and of what type the function expects.
            if let Some(builtin_fn) = BUILTIN_FUNCTIONS.get(fn_name.as_str()) {
                return match builtin_fn.arg_types.len() {
                    0 => BetterError {
                        message: format!("Error: {} does not expect any inputs.", builtin_fn.name),
                        line: pos.line(),
                        col: pos.position(),
                    },
                    1 => BetterError {
                        message: format!(
                            "Error: {} expects one {} as an input.",
                            builtin_fn.name, builtin_fn.arg_types[0]
                        ),
                        line: pos.line(),
                        col: pos.position(),
                    },
                    _ => BetterError {
                        message: format!(
                            "Error: Wrong inputs for {}. Expected ({}).",
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

    // log!("Error: {}", err);
    let message = trim_message(err.to_string().as_str()).to_string();
    let line = err.position().line();
    let col = err.position().position();
    BetterError { message, line, col }
}

#[cfg(test)]
mod tests {
    use super::*;

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
    fn test_convert_err() {
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(String::from(";"), String::from("at end of line")),
            rhai::Position::new(5, 1),
        );
        let err = convert_err(Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from("Syntax Error: Missing semicolon ';' at end of line."),
                line: Some(5),
                col: Some(1),
            }
        );
    }
}
