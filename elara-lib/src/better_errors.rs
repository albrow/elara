use regex::Regex;
use rhai::EvalAltResult;

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

impl From<Box<EvalAltResult>> for BetterError {
    fn from(err: Box<EvalAltResult>) -> Self {
        let message = trim_message(err.to_string().as_str()).to_string();
        let line = err.position().line();
        let col = err.position().position();
        BetterError { message, line, col }
    }
}

/// Trim the message to not include position information.
///
/// Example:
///
/// ```
///    trim_message("Function not found: move_down () (line 5, position 1)")
///    "Function not found: move_down ()"
/// ```
fn trim_message(message: &str) -> String {
    let re = Regex::new(r" \(line \d+, position \d+\)$").unwrap();
    re.replace(message, "").to_string()
}

pub fn convert_err(err: Box<EvalAltResult>) -> BetterError {
    match *err {
        EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(ref token, ref desc),
            ref pos,
        ) => {
            if (token == ";") && (desc == "at end of line") {
                return BetterError {
                    message: String::from("Missing semicolon ';' at end of line."),
                    line: pos.line(),
                    col: pos.position(),
                };
            }
        }
        _ => {}
    }

    BetterError::from(err)
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
                message: String::from("Missing semicolon ';' at end of line."),
                line: Some(5),
                col: Some(1),
            }
        );
    }
}
