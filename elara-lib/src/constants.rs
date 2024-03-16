use std::collections::HashMap;

/// Width and height of the grid.
pub static WIDTH: u32 = 12;
pub static HEIGHT: u32 = 8;

/// Max amount of energy that the player can have.
pub static MAX_ENERGY: u32 = 50;

/// The amount of energy to add if the player is on a energy cell.
pub static ENERGY_CELL_AMOUNT: u32 = 10;

// Various common error messages.
pub static ERR_OUT_OF_ENERGY: &str = "G.R.O.V.E.R. ran out of energy!";
pub static ERR_DESTROYED_BY_ENEMY: &str =
    "G.R.O.V.E.R. was attacked and disabled by a malfunctioning rover. Try again!";
/// A special error message that is returned when the simulation ends before
/// the script finishes running. I.e., this is a way for us to abort running
/// a script if the simulation outcome does not require us to continue running
/// it.
pub static ERR_SIMULATION_END: &str = "SIMULATION_END";
/// Returned from read_data if you call it when not adjacent to a data point.
pub static ERR_NO_DATA_POINT: &str = "read_data only works if you are next to a data point.";
/// Returned from press_button if you call it when not adjacent to a button.
pub static ERR_NO_BUTTON: &str = "press_button only works if you are next to a button.";
/// Returned as the "input" to a BadInput error by our custom semicolon checker code
/// if there is a line break in the middle of a function call.
pub static BAD_INPUT_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL: &str = "line break in function call";
/// Returned as the end-user error message if there is a line break in the middle of a function call.
pub static ERR_UNEXPECTED_LINE_BREAK_IN_FUNCTION_CALL: &str =
    "Error: Unexpected line break. (Hint: you may need to move the function arguments to the same line as the function call.)";
pub static ERR_UNEXPECTED_SPACE_IN_VAR_NAME: &str = "Syntax Error: Variable names cannot contain spaces. (Hint: try using an underscore instead of a space.)";
pub static ERR_UNEXPECTED_SPACE_IN_FUNC_NAME: &str = "Syntax Error: Function names cannot contain spaces. (Hint: try using an underscore instead of a space.)";

// Special error messages displayed to the player in Player.err_message. These don't
// cause the simulation to end, but they are displayed to the player in the UI.

/// Shown when pick_up is called but there is nothing in front of the player to pick up.
pub static PLAYER_ERR_NOTHING_TO_PICK_UP: &str = "Nothing in front of me to pick up!";
/// Shown when pick_up is called but the player is already holding something.
pub static PLAYER_ERR_ALREADY_HOLDING: &str = "I'm already holding something!";
/// Shown when drop is called but the player is not holding anything.
pub static PLAYER_ERR_NOTHING_TO_DROP: &str = "I don't have anything to drop!";
/// Shown when drop is called but there is no space in front of the player to drop the crate.
pub static PLAYER_ERR_NO_SPACE_TO_DROP: &str = "No space in front of me to drop something!";

pub struct BuiltinFunction {
    pub name: &'static str,
    pub arg_types: &'static [&'static str],
}

lazy_static! {
    pub static ref BUILTIN_FUNCTIONS: HashMap<&'static str, BuiltinFunction> = {
        let mut m: HashMap<&'static str, BuiltinFunction> = HashMap::new();

        m.insert(
            "turn_right",
            BuiltinFunction {
                name: "turn_right",
                arg_types: &[],
            },
        );
        m.insert(
            "turn_left",
            BuiltinFunction {
                name: "turn_left",
                arg_types: &[],
            },
        );
        m.insert(
            "move_forward",
            BuiltinFunction {
                name: "move_forward",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_backward",
            BuiltinFunction {
                name: "move_backward",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_down",
            BuiltinFunction {
                name: "move_down",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_up",
            BuiltinFunction {
                name: "move_up",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_left",
            BuiltinFunction {
                name: "move_left",
                arg_types: &["number"],
            },
        );
        m.insert(
            "move_right",
            BuiltinFunction {
                name: "move_right",
                arg_types: &["number"],
            },
        );
        m.insert(
            "say",
            BuiltinFunction {
                name: "say",
                arg_types: &["any"],
            },
        );
        m.insert(
            "get_position",
            BuiltinFunction {
                name: "get_position",
                arg_types: &[],
            },
        );
        m.insert(
            "get_orientation",
            BuiltinFunction {
                name: "get_orientation",
                arg_types: &[],
            },
        );
        m.insert(
            "add",
            BuiltinFunction {
                name: "add",
                arg_types: &["number", "number"],
            },
        );
        m.insert(
            "read_data",
            BuiltinFunction {
                name: "read_data",
                arg_types: &[],
            },
        );
        m.insert(
            "wait",
            BuiltinFunction {
                name: "wait",
                arg_types: &["number"],
            },
        );
        m.insert(
            "push",
            BuiltinFunction {
                name: "push",
                arg_types: &["array", "any"],
            },
        );
        m.insert(
            "press_button",
            BuiltinFunction {
                name: "press_button",
                arg_types: &[],
            },
        );
        m.insert(
            "pick_up",
            BuiltinFunction {
                name: "pick_up",
                arg_types: &[],
            },
        );
        m.insert(
            "drop",
            BuiltinFunction {
                name: "drop",
                arg_types: &[],
            },
        );

        m
    };
}
