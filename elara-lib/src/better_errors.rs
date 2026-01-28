use std::collections::HashMap;

use regex::Regex;
use rhai::EvalAltResult;

use crate::constants::{
    BAD_INPUT_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL, BUILTIN_FUNCTIONS,
    ERR_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL, ERR_UNEXPECTED_SPACE_IN_FUNC_NAME,
    ERR_UNEXPECTED_SPACE_IN_VAR_NAME,
};

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

fn trim_message(message: &str) -> String {
    let re = Regex::new(r" \(line \d+, position \d+\)$").unwrap();
    re.replace(message, "").to_string()
}

fn fn_name_from_sig(fn_signature: &str) -> String {
    let re = Regex::new(r"\(.*\)").unwrap();
    re.replace(fn_signature, "").trim().to_string()
}

pub fn search_prev_lines(script: &str, start_line: usize) -> usize {
    let mut line = start_line;
    while line >= 2 {
        let prev_line = script.lines().nth(line - 2).unwrap();
        if prev_line.trim().is_empty()
            || prev_line.contains("//")
            || prev_line.trim().ends_with('}')
            || prev_line.trim().ends_with('{')
        {
            line -= 1;
            continue;
        }
        if !prev_line.ends_with(';') {
            return line - 1;
        }
        return start_line;
    }
    start_line
}

fn convert_func_not_found_err(
    avail_funcs: &[String],
    disabled_funcs: &'static [&'static str],
    fn_sig: &str,
    pos: &rhai::Position,
) -> BetterError {
    let fn_name = fn_name_from_sig(fn_sig);

    if disabled_funcs.contains(&fn_name.as_str()) {
        return BetterError {
            message: format!("Ошибка: Функция {fn_name} отключена для этого уровня"),
            line: pos.line(),
            col: pos.position(),
        };
    }

    if BUILTIN_FUNCTIONS.contains_key(fn_name.as_str()) && !avail_funcs.contains(&fn_name) {
        return BetterError {
            message: format!("Ошибка: Вы ещё не разблокировали функцию {fn_name}"),
            line: pos.line(),
            col: pos.position(),
        };
    }

    if let Some(builtin_fn) = BUILTIN_FUNCTIONS.get(fn_name.as_str()) {
        return match builtin_fn.arg_types.len() {
            0 => BetterError {
                message: format!(
                    "Ошибка: Функция {} не должна иметь никаких аргументов.",
                    builtin_fn.name
                ),
                line: pos.line(),
                col: pos.position(),
            },
            1 => {
                if builtin_fn.arg_types[0] == "any" {
                    BetterError {
                        message: format!(
                            "Ошибка: Функция {} должна иметь один аргумент любого типа.",
                            builtin_fn.name
                        ),
                        line: pos.line(),
                        col: pos.position(),
                    }
                } else {
                    let arg_type_ru = match builtin_fn.arg_types[0] {
                        "number" => "число",
                        "string" => "строку",
                        "array" => "массив",
                        _ => builtin_fn.arg_types[0],
                    };
                    BetterError {
                        message: format!(
                            "Ошибка: Функция {} должна принимать {} в качестве аргумента.",
                            builtin_fn.name, arg_type_ru
                        ),
                        line: pos.line(),
                        col: pos.position(),
                    }
                }
            }
            _ => BetterError {
                message: format!(
                    "Ошибка: Неверные аргументы для функции {}. Должно быть {} аргументов ({}).",
                    builtin_fn.name,
                    builtin_fn.arg_types.len(),
                    builtin_fn.arg_types.join(", ")
                ),
                line: pos.line(),
                col: pos.position(),
            },
        };
    }

    BetterError {
        message: format!("Ошибка: Функции с именем {fn_name} не существует (возможно, опечатка?)"),
        line: pos.line(),
        col: pos.position(),
    }
}

fn is_extra_parentheses_set(script: &str, err_pos: &rhai::Position) -> bool {
    if let Some(line_number) = err_pos.line() {
        let line = script.lines().nth(line_number - 1).unwrap();
        if line.contains(")()") || line.contains("()(") {
            return true;
        }
    }
    false
}

fn is_extra_closing_parentheses(script: &str, err_pos: &rhai::Position) -> bool {
    if let Some(line_number) = err_pos.line() {
        let line = script.lines().nth(line_number - 1).unwrap();
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

fn is_space_in_variable_name(script: &str, err_pos: &rhai::Position) -> bool {
    if let Some(line_number) = err_pos.line() {
        let line = script.lines().nth(line_number - 1).unwrap();
        let re = Regex::new(r"let\s\w+\s\w+[^=]").unwrap();
        if re.is_match(line) {
            return true;
        }
    }
    false
}

fn is_space_in_func_name(script: &str, err_pos: &rhai::Position) -> bool {
    if let Some(line_number) = err_pos.line() {
        let line = script.lines().nth(line_number - 1).unwrap();
        let re = Regex::new(r"fn\s\w+\s\w+\(").unwrap();
        if re.is_match(line) {
            return true;
        }
    }
    false
}

fn convert_missing_semicolon_error(script: &str, desc: &str, pos: &rhai::Position) -> BetterError {
    if is_space_in_variable_name(script, pos) {
        return BetterError {
            message: String::from(ERR_UNEXPECTED_SPACE_IN_VAR_NAME),
            line: pos.line(),
            col: pos.position(),
        };
    }

    if desc == "at end of line" {
        return BetterError {
            message: String::from("Синтаксическая ошибка: Пропущена точка с запятой ';' в конце строки."),
            line: pos.line(),
            col: pos.position(),
        };
    }
    if desc == "to terminate this statement" {
        if is_extra_parentheses_set(script, pos) {
            return BetterError {
                message: String::from("Синтаксическая ошибка: Лишние скобки '()'."),
                line: pos.line(),
                col: pos.position(),
            };
        } else if is_extra_closing_parentheses(script, pos) {
            return BetterError {
                message: String::from("Синтаксическая ошибка: Лишняя закрывающая скобка ')'."),
                line: pos.line(),
                col: pos.position(),
            };
        }

        let orig_line = pos.line().unwrap();
        let mut message = String::from(
            "Синтаксическая ошибка: Пропущена точка с запятой ';' после вызова функции или оператора.",
        );
        let line = search_prev_lines(script, orig_line);
        if line != orig_line {
            message = String::from("Синтаксическая ошибка: Пропущена точка с запятой ';' в конце строки.");
        }

        return BetterError {
            message,
            line: Some(line),
            col: pos.position(),
        };
    }

    BetterError {
        message: String::from("Синтаксическая ошибка: Пропущена точка с запятой ';' в конце строки."),
        line: pos.line(),
        col: pos.position(),
    }
}

lazy_static! {
    static ref UNDEF_VARIABLE_HINTS: HashMap<&'static str, &'static str> = {
        let mut m: HashMap<&'static str, &'static str> = HashMap::new();
        m.insert("Loop", "Вы имели в виду loop с маленькой буквы 'l'?");
        m.insert("Let", "Вы имели в виду let с маленькой буквы 'l'?");
        m.insert("If", "Вы имели в виду if с маленькой буквы 'i'?");
        m.insert("lovelace", "Если вы хотели строку, возможно, вы забыли кавычки?");
        m.insert("left", "Если вы хотели строку, возможно, вы забыли кавычки?");
        m.insert("right", "Если вы хотели строку, возможно, вы забыли кавычки?");
        m.insert("top", "Если вы хотели строку, возможно, вы забыли кавычки?");
        m.insert("middle", "Если вы хотели строку, возможно, вы забыли кавычки?");
        m.insert("bottom", "Если вы хотели строку, возможно, вы забыли кавычки?");
        m
    };
}

fn convert_var_not_found_error(var_name: &str, pos: &rhai::Position) -> BetterError {
    if UNDEF_VARIABLE_HINTS.contains_key(var_name) {
        BetterError {
            message: format!(
                r#"Ошибка: Переменная не найдена: {}. (Подсказка: {})"#,
                var_name, UNDEF_VARIABLE_HINTS[var_name]
            ),
            line: pos.line(),
            col: pos.position(),
        }
    } else if BUILTIN_FUNCTIONS.contains_key(var_name) {
        BetterError {
            message: format!(
                r#"Ошибка: Переменная не найдена: {}. (Подсказка: если вы хотели вызвать функцию, не забудьте добавить скобки после имени функции.)"#,
                var_name,
            ),
            line: pos.line(),
            col: pos.position(),
        }
    } else {
        BetterError {
            message: format!("Ошибка: Переменная не найдена: {}", var_name),
            line: pos.line(),
            col: pos.position(),
        }
    }
}

fn convert_missing_comma_separate_args_error(
    script: String,
    desc: &str,
    pos: &rhai::Position,
) -> BetterError {
    let re = Regex::new(r"to separate the arguments to function call '(.*)'$").unwrap();
    let captures = re.captures(desc).unwrap();
    let fn_name = captures.get(1).unwrap().as_str();

    let mut line = pos.line().unwrap();
    while line >= 1 {
        let prev_line = script.lines().nth(line - 1).unwrap();
        if prev_line.contains(fn_name) {
            break;
        }
        line -= 1;
    }

    let mut col = pos.position().unwrap();
    let line_text = script.lines().nth(line - 1).unwrap();
    let mut fn_name_found = false;
    for c in line_text.chars() {
        if c == '(' {
            fn_name_found = true;
            continue;
        }
        if fn_name_found {
            if c == ')' {
                break;
            }
            col += 1;
        }
    }

    if let Some(builtin_fn) = BUILTIN_FUNCTIONS.get(fn_name) {
        if builtin_fn.arg_types.len() <= 1 {
            return BetterError {
                message: format!(
                    "Синтаксическая ошибка: Пропущена закрывающая скобка ')' для функции {}.",
                    fn_name
                ),
                line: Some(line),
                col: Some(col),
            };
        }
    }

    BetterError {
        message: format!(
            "Синтаксическая ошибка: Возможно, пропущена закрывающая скобка ')' для функции \
            {}. Или, если функция ожидает более одного аргумента, возможно, \
            пропущена запятая ',' для их разделения.",
            fn_name
        ),
        line: Some(line),
        col: Some(col),
    }
}

fn convert_missing_fn_params_error(
    script: String,
    fn_name: &str,
    err_pos: &rhai::Position,
) -> BetterError {
    if is_space_in_func_name(&script, err_pos) {
        BetterError {
            message: String::from(ERR_UNEXPECTED_SPACE_IN_FUNC_NAME),
            line: err_pos.line(),
            col: err_pos.position(),
        }
    } else {
        BetterError {
            message: format!(
                "Синтаксическая ошибка: Пропущены скобки '()' после имени функции '{}'.",
                fn_name
            ),
            line: err_pos.line(),
            col: err_pos.position(),
        }
    }
}

pub fn convert_err(
    avail_funcs: &[String],
    disabled_funcs: &'static [&'static str],
    script: String,
    err: Box<EvalAltResult>,
) -> BetterError {
    log!("{:?}", err);
    match *err {
        EvalAltResult::ErrorTooManyOperations(ref pos) => {
            return BetterError {
                message: String::from("Ошибка: Обнаружен возможный бесконечный цикл."),
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
            if token == "," && desc.as_str().contains("to separate the arguments") {
                return convert_missing_comma_separate_args_error(script, desc, pos);
            }
        }
        EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::FnMissingParams(ref fn_name),
            ref pos,
        ) => {
            return convert_missing_fn_params_error(script, fn_name, pos);
        }
        EvalAltResult::ErrorFunctionNotFound(ref fn_sig, ref pos) => {
            return convert_func_not_found_err(avail_funcs, disabled_funcs, fn_sig, pos);
        }
        EvalAltResult::ErrorVariableNotFound(ref var_name, ref pos) => {
            return convert_var_not_found_error(var_name, pos);
        }
        EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::VariableUndefined(ref var_name),
            ref pos,
        ) => {
            return convert_var_not_found_error(var_name, pos);
        }
        EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::BadInput(rhai::LexError::UnterminatedString),
            ref pos,
        ) => {
            return BetterError {
                message: String::from("Ошибка: В строке отсутствует закрывающая кавычка."),
                line: pos.line(),
                col: pos.position(),
            };
        }
        EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::BadInput(rhai::LexError::UnexpectedInput(ref input)),
            ref pos,
        ) => {
            if input == BAD_INPUT_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL {
                return BetterError {
                    message: String::from(ERR_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL),
                    line: pos.line(),
                    col: pos.position(),
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
    use crate::constants::{
        ERR_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL, ERR_UNEXPECTED_SPACE_IN_FUNC_NAME,
        ERR_UNEXPECTED_SPACE_IN_VAR_NAME,
    };

    use super::*;

    lazy_static! {
        static ref AVAIL_FUNCS: Vec<String> = vec![
            "move_forward".to_string(),
            "move_backward".to_string(),
            "turn_left".to_string(),
            "turn_right".to_string(),
            "say".to_string(),
        ];
        static ref AVAIL_FUNCS_IMPAIRED_MOVEMENT: Vec<String> = vec![
            "move_backward".to_string(),
            "turn_left".to_string(),
            "say".to_string(),
        ];
        static ref DISABLED_FUNCS_IMPAIRED_MOVEMENT: Vec<&'static str> =
            vec!["move_forward", "turn_right"];
        static ref NO_DISABLED_FUNCS: Vec<&'static str> = vec![];
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
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Синтаксическая ошибка: Пропущена точка с запятой ';' в конце строки.",
                ),
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
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Синтаксическая ошибка: Пропущена точка с запятой ';' в конце строки.",
                ),
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
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Синтаксическая ошибка: Пропущена точка с запятой ';' после вызова функции или оператора.",
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
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Синтаксическая ошибка: Пропущена точка с запятой ';' после вызова функции или оператора.",
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
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Синтаксическая ошибка: Пропущена точка с запятой ';' после вызова функции или оператора.",
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
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Синтаксическая ошибка: Пропущена точка с запятой ';' после вызова функции или оператора.",
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
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Синтаксическая ошибка: Пропущена точка с запятой ';' в конце строки.",
                ),
                line: Some(1),
                col: Some(1),
            }
        );
    }

    #[test]
    fn test_convert_func_not_found_err() {
        // Built-in function, not unlocked yet.
        let script = String::from(r"press_button(1);");
        let err = EvalAltResult::ErrorFunctionNotFound(
            String::from("press_button (i64)"),
            rhai::Position::new(1, 1),
        );
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from("Ошибка: Вы ещё не разблокировали функцию press_button"),
                line: Some(1),
                col: Some(1),
            }
        );

        // Built-in function, unlocked but disabled.
        let script = String::from(r"move_forward(1);");
        let err = EvalAltResult::ErrorFunctionNotFound(
            String::from("move_forward (i64)"),
            rhai::Position::new(1, 1),
        );
        let err = convert_err(
            &AVAIL_FUNCS_IMPAIRED_MOVEMENT,
            &DISABLED_FUNCS_IMPAIRED_MOVEMENT,
            script,
            Box::new(err),
        );
        assert_eq!(
            err,
            BetterError {
                message: String::from("Ошибка: Функция move_forward отключена для этого уровня"),
                line: Some(1),
                col: Some(1),
            }
        );

        // Built-in function but wrong number of arguments.
        let script = String::from(r"move_forward(1, 2);");
        let err = EvalAltResult::ErrorFunctionNotFound(
            String::from("move_forward (i64, i64)"),
            rhai::Position::new(1, 1),
        );
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Ошибка: Функция move_forward должна принимать число в качестве аргумента.",
                ),
                line: Some(1),
                col: Some(1),
            }
        );

        // Built-in function but wrong type of argument.
        let script = String::from(r"move_forward(true);");
        let err = EvalAltResult::ErrorFunctionNotFound(
            String::from("move_forward (bool)"),
            rhai::Position::new(1, 1),
        );
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Ошибка: Функция move_forward должна принимать число в качестве аргумента.",
                ),
                line: Some(1),
                col: Some(1),
            }
        );

        // Not a built-in function.
        let script = String::from(r"move_diagonally(42);");
        let err = EvalAltResult::ErrorFunctionNotFound(
            String::from("move_diagonally (i64)"),
            rhai::Position::new(1, 1),
        );
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(
                    "Ошибка: Функции с именем move_diagonally не существует (возможно, опечатка?)",
                ),
                line: Some(1),
                col: Some(1),
            }
        );
    }

    #[test]
    fn test_convert_err_line_break_in_function_call() {
        let script = String::from(
            r"move_forward(
                1
            );",
        );
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::BadInput(rhai::LexError::UnexpectedInput(
                BAD_INPUT_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL.to_string(),
            )),
            rhai::Position::new(1, 13),
        );
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(ERR_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL),
                line: Some(1),
                col: Some(13),
            }
        );
    }

    #[test]
    fn test_convert_err_space_in_var_name() {
        let script = String::from(r"let my var = 42;");
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::MissingToken(
                String::from(";"),
                String::from("to terminate this statement"),
            ),
            rhai::Position::new(1, 6),
        );
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(ERR_UNEXPECTED_SPACE_IN_VAR_NAME),
                line: Some(1),
                col: Some(6),
            }
        );
    }

    #[test]
    fn test_convert_err_space_in_func_name() {
        let script = String::from(r"fn my func() {}");
        let err = EvalAltResult::ErrorParsing(
            rhai::ParseErrorType::FnMissingParams(String::from("my")),
            rhai::Position::new(1, 7),
        );
        let err = convert_err(&AVAIL_FUNCS, &NO_DISABLED_FUNCS, script, Box::new(err));
        assert_eq!(
            err,
            BetterError {
                message: String::from(ERR_UNEXPECTED_SPACE_IN_FUNC_NAME),
                line: Some(1),
                col: Some(7),
            }
        );
    }

    #[test]
    fn test_fn_name_from_sig() {
        assert_eq!(fn_name_from_sig("move_down (i64, i64)"), "move_down");
        assert_eq!(fn_name_from_sig("move_down ()"), "move_down");
    }
}
