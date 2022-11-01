/// Width and height of the grid.
pub static WIDTH: u32 = 12;
pub static HEIGHT: u32 = 8;

/// Max amount of fuel that the player can have.
pub static MAX_FUEL: u32 = 50;

/// The amount of fuel to add if the player is on a fuel spot.
pub static FUEL_SPOT_AMOUNT: u32 = 10;

/// Various common error messages.
pub static ERR_OUT_OF_FUEL: &str = "You ran out of fuel!";
pub static ERR_DESTROYED_BY_BUG: &str =
    "A bug has attacked the drone and it is damaged beyond repair.";
/// A special error message that is returned when the simulation ends before
/// the script finishes running. I.e., this is a way for us to abort running
/// a script if the simulation outcome does not require us to continue running
/// it.
pub static ERR_SIMULATION_END: &str = "SIMULATION_END";
