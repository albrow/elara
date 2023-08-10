use rhai::Dynamic;
use std::fmt;

use crate::{
    actors::PlayerChannelActor,
    constants::MAX_ENERGY,
    levels::{Level, Outcome, LEVELS},
};

pub trait Actor {
    fn apply(&mut self, state: State) -> State;
}

pub struct Simulation {
    state_idx: usize,
    states: Vec<State>,
    player_actor: PlayerChannelActor,
    level: &'static dyn Level,
    last_outcome: Outcome,
}

impl Simulation {
    pub fn new(player_actor: PlayerChannelActor) -> Simulation {
        let sim = Simulation {
            state_idx: 0,
            states: vec![],
            player_actor: player_actor,
            // Start with the first level by default. Will be overwritten by
            // load_level.
            level: LEVELS.values().next().unwrap().as_ref(),
            last_outcome: Outcome::Continue,
        };
        sim
    }

    /// Loads the given level and creates the initial state using the given
    /// seed. If the level has multiple possible initial states, "seed"
    /// determines which initial state to use.
    ///
    /// Note(albrow): "seed" may also be used as a random number generator
    /// seed to control random behavior in the future.
    pub fn load_level(&mut self, level: &'static dyn Level, seed: usize) {
        self.level = level;
        self.state_idx = 0;
        self.player_actor.set_bounds(level.bounds());
        self.states.clear();
        self.states.push(self.level.initial_states()[seed].clone());
        self.last_outcome = Outcome::Continue;
    }

    pub fn curr_level(&self) -> &'static dyn Level {
        self.level
    }

    pub fn curr_state(&self) -> State {
        self.states[self.state_idx].clone()
    }

    pub fn get_history(&self) -> Vec<State> {
        self.states.to_vec()
    }

    // TODO(albrow): Can we avoid cloning the outcome here and in other places?
    pub fn last_outcome(&self) -> Outcome {
        self.last_outcome.clone()
    }

    pub fn step_forward(&mut self) -> Outcome {
        // If the current outcome is not Continue, then we can't take any more
        // steps forward. This happens if the player has already won or lost.
        if self.last_outcome != Outcome::Continue && self.last_outcome != Outcome::NoObjective {
            return self.last_outcome.clone();
        }

        // Otherwise, compute the next state and store it.
        let mut next_state = self.curr_state().clone();
        // 1. Apply the player actor first, separately from the other actors.
        next_state = self.player_actor.apply(next_state);
        // 2. Check for win or lose conditions.
        let outcome = self.level.check_win(&next_state);
        match outcome {
            Outcome::Success => {
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Success;
                return outcome;
            }
            Outcome::Failure(msg) => {
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Failure(msg.clone());
                return self.last_outcome.clone();
            }
            Outcome::Continue => {}
            Outcome::NoObjective => {
                self.last_outcome = Outcome::NoObjective;
            }
        }
        // 3. Apply the other actors.
        for actor in &mut self.level.actors() {
            next_state = actor.apply(next_state);
        }
        // 4. Check for win or lose conditions again.
        let outcome = self.level.check_win(&next_state);
        match outcome {
            Outcome::Success => {
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Success;
                return outcome;
            }
            Outcome::Failure(msg) => {
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Failure(msg.clone());
                return self.last_outcome.clone();
            }
            Outcome::Continue => {}
            Outcome::NoObjective => {
                self.last_outcome = Outcome::NoObjective;
            }
        }

        // log!(
        //     "finished computing step {}: {:?}",
        //     self.state_idx,
        //     next_state
        // );
        self.states.push(next_state);
        self.state_idx += 1;
        self.last_outcome.clone()
    }
}

#[derive(Clone, PartialEq)]
pub struct State {
    pub player: Player,
    pub goals: Vec<Goal>,
    pub obstacles: Vec<Obstacle>,
    pub energy_cells: Vec<EnergyCell>,
    pub buttons: Vec<Button>,
    pub gates: Vec<Gate>,
    pub data_points: Vec<DataPoint>,
    pub password_gates: Vec<PasswordGate>,
    pub telepads: Vec<Telepad>,
    pub enemies: Vec<Enemy>,
    pub big_enemies: Vec<BigEnemy>,
}

impl State {
    pub fn new() -> State {
        State {
            player: Player::new(0, 0, MAX_ENERGY, Orientation::Right),
            goals: vec![],
            obstacles: vec![],
            energy_cells: vec![],
            buttons: vec![],
            gates: vec![],
            password_gates: vec![],
            data_points: vec![],
            telepads: vec![],
            enemies: vec![],
            big_enemies: vec![],
        }
    }
}

impl fmt::Debug for State {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("State")
            .field("player", &self.player)
            .field("goal", &self.goals)
            // Omitting obstacles field since it can be very long and
            // the obstacles never move.
            // .field("obstacles", &self.obstacles)
            .field("energy_cells", &self.energy_cells)
            .field("buttons", &self.buttons)
            .field("gates", &self.gates)
            .field("data_points", &self.data_points)
            .field("password_gates", &self.password_gates)
            .field("telepads", &self.telepads)
            .field("enemies", &self.enemies)
            .finish()
    }
}

#[derive(Clone, PartialEq, Debug, Copy)]
pub enum Orientation {
    Up,
    Down,
    Left,
    Right,
}

impl Orientation {
    pub fn flip(&self) -> Orientation {
        match self {
            Orientation::Up => Orientation::Down,
            Orientation::Down => Orientation::Up,
            Orientation::Left => Orientation::Right,
            Orientation::Right => Orientation::Left,
        }
    }

    pub fn rotate_clockwise(&self) -> Orientation {
        match self {
            Orientation::Up => Orientation::Right,
            Orientation::Down => Orientation::Left,
            Orientation::Left => Orientation::Up,
            Orientation::Right => Orientation::Down,
        }
    }

    pub fn rotate_counter_clockwise(&self) -> Orientation {
        match self {
            Orientation::Up => Orientation::Left,
            Orientation::Down => Orientation::Right,
            Orientation::Left => Orientation::Down,
            Orientation::Right => Orientation::Up,
        }
    }
}

/// The animation state of the player sprite. This is used in
/// in the UI to give more clarity to the player about what is
/// happening.
#[derive(Clone, PartialEq, Debug)]
pub enum PlayerAnimState {
    Idle,
    Moving,
    Turning,
    Teleporting(TeleAnimData),
    Bumping(BumpAnimData),
}

#[derive(Clone, PartialEq, Debug)]
pub struct TeleAnimData {
    pub start_pos: Pos, // The position of the rover before entering telepad.
    pub enter_pos: Pos, // The position of the telepad entrance.
    pub exit_pos: Pos,  // The position of the telepad exit.
}

#[derive(Clone, PartialEq, Debug)]
pub struct BumpAnimData {
    pub pos: Pos,          // The position of the rover.
    pub obstacle_pos: Pos, // The position of the obstacle the rover is bumping into.
}

#[derive(Clone, PartialEq, Debug)]
pub struct Player {
    pub pos: Pos,
    pub energy: u32,
    pub message: String,
    pub anim_state: PlayerAnimState,
    pub facing: Orientation,
    pub total_energy_used: u32,
}

impl Player {
    pub fn new(x: u32, y: u32, energy: u32, facing: Orientation) -> Player {
        Player {
            pos: Pos::new(x as i32, y as i32),
            energy: energy,
            message: String::new(),
            anim_state: PlayerAnimState::Idle,
            facing: facing,
            total_energy_used: 0,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct EnergyCell {
    pub pos: Pos,
    pub collected: bool,
}

impl EnergyCell {
    pub fn new(x: u32, y: u32) -> EnergyCell {
        EnergyCell {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            collected: false,
        }
    }
}

// Indicates what the button is connected to.
#[derive(Clone, PartialEq, Debug)]
pub enum ButtonConnection {
    /// The button is not connected to anything.
    None,
    /// The button is connected to a gate. The usize is the index of the gate.
    Gate(usize),
}

#[derive(Clone, PartialEq, Debug)]
pub struct Button {
    pub pos: Pos,
    pub currently_pressed: bool,
    pub connection: ButtonConnection,
    /// Additional information that will be displayed in the UI.
    /// (e.g. explain what the button will do when pressed)
    pub additional_info: String,
}

impl Button {
    pub fn new(x: u32, y: u32, connection: ButtonConnection) -> Button {
        Button {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            connection,
            currently_pressed: false,
            additional_info: String::new(),
        }
    }
    pub fn new_with_info(
        x: u32,
        y: u32,
        connection: ButtonConnection,
        additional_info: String,
    ) -> Button {
        Button {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            connection: connection,
            currently_pressed: false,
            additional_info,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Goal {
    pub pos: Pos,
}

impl Goal {
    pub fn new(x: u32, y: u32) -> Goal {
        Goal {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
        }
    }
}

/// The animation state of the enemy sprite.
#[derive(Clone, PartialEq, Debug)]
pub enum EnemyAnimState {
    Idle,
    Moving,
    Turning,
    Teleporting(TeleAnimData),
    Bumping(BumpAnimData),
}

/// The animation state of the big enemy sprite.
#[derive(Clone, PartialEq, Debug)]
pub enum BigEnemyAnimState {
    Idle,
    Moving,
    Turning,
    Bumping(BumpAnimData),
    ShuttingDown,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Enemy {
    pub pos: Pos,
    pub facing: Orientation,
    pub anim_state: EnemyAnimState,
}

impl Enemy {
    pub fn new(x: u32, y: u32, facing: Orientation) -> Enemy {
        Enemy {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            facing,
            anim_state: EnemyAnimState::Idle,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct BigEnemy {
    pub pos: Pos,
    pub facing: Orientation,
    pub anim_state: BigEnemyAnimState,
    pub disabled: bool,
}

impl BigEnemy {
    pub fn new(x: u32, y: u32, facing: Orientation, disabled: bool) -> BigEnemy {
        BigEnemy {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            facing,
            anim_state: BigEnemyAnimState::Idle,
            disabled,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Obstacle {
    pub pos: Pos,
}

impl Obstacle {
    pub fn new(x: u32, y: u32) -> Obstacle {
        Obstacle {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub enum GateVariant {
    NWSE,
    NESW,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Gate {
    pub pos: Pos,
    pub open: bool,
    /// Orientation of the gate. Either from Northwest to Southeast or from
    /// Northeast to Southwest.
    pub variant: GateVariant,
    /// Additional information that will be displayed in the UI.
    /// (e.g. explain what the password is or how to get it)
    pub additional_info: String,
}

impl Gate {
    pub fn new(x: u32, y: u32, open: bool, variant: GateVariant) -> Gate {
        Gate {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            open,
            variant,
            additional_info: String::new(),
        }
    }
    pub fn new_with_info(
        x: u32,
        y: u32,
        open: bool,
        variant: GateVariant,
        additional_info: String,
    ) -> Gate {
        Gate {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            open,
            variant,
            additional_info,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct PasswordGate {
    pub pos: Pos,
    pub open: bool,
    pub password: String,
    /// Orientation of the gate. Either from Northwest to Southeast or from
    /// Northeast to Southwest.
    pub variant: GateVariant,
    /// Additional information that will be displayed in the UI.
    /// (e.g. explain what the password is or how to get it)
    pub additional_info: String,
}

impl PasswordGate {
    pub fn new(x: u32, y: u32, password: String, open: bool, variant: GateVariant) -> PasswordGate {
        PasswordGate {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            open,
            password,
            variant,
            additional_info: String::new(),
        }
    }
    pub fn new_with_info(
        x: u32,
        y: u32,
        password: String,
        open: bool,
        variant: GateVariant,
        additional_info: String,
    ) -> PasswordGate {
        PasswordGate {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            password,
            open,
            variant,
            additional_info,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub enum TermData {
    String(String),
    Array(Vec<TermData>),
}

impl From<String> for TermData {
    fn from(s: String) -> TermData {
        TermData::String(s)
    }
}

impl From<&str> for TermData {
    fn from(s: &str) -> TermData {
        TermData::String(s.to_string())
    }
}

impl<T: Into<TermData>> From<Vec<T>> for TermData {
    fn from(v: Vec<T>) -> TermData {
        TermData::Array(v.into_iter().map(|x| x.into()).collect())
    }
}

impl From<TermData> for Dynamic {
    fn from(data: TermData) -> Dynamic {
        match data {
            TermData::String(s) => s.into(),
            TermData::Array(v) => Dynamic::from_array(v.into_iter().map(|x| x.into()).collect()),
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct DataPoint {
    pub pos: Pos,
    pub data: TermData,
    pub reading: bool,
    /// Additional information that will be displayed in the UI.
    /// (e.g. explain what the data point will output)
    pub additional_info: String,
}

impl DataPoint {
    pub fn new(x: u32, y: u32, data: TermData) -> DataPoint {
        DataPoint {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            data,
            reading: false,
            additional_info: String::new(),
        }
    }
    pub fn new_with_info(x: u32, y: u32, data: TermData, additional_info: String) -> DataPoint {
        DataPoint {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            data,
            reading: false,
            additional_info,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Pos {
    pub x: i32,
    pub y: i32,
}

impl Pos {
    pub fn new(x: i32, y: i32) -> Pos {
        Pos { x, y }
    }

    // Returns i64 for better Rhai compatibility.
    pub fn get_x(&mut self) -> i64 {
        self.x as i64
    }

    // Returns i64 for better Rhai compatibility.
    pub fn get_y(&mut self) -> i64 {
        self.y as i64
    }
}

/// Returns the index of the data point adjacent to the given
/// position. Returns None if there is no adjacent data point.
pub fn get_adjacent_point(state: &State, pos: &Pos) -> Option<usize> {
    for (i, d_point) in state.data_points.iter().enumerate() {
        if d_point.pos.x == pos.x && d_point.pos.y == pos.y + 1 {
            return Some(i);
        }
        if pos.y != 0 && d_point.pos.x == pos.x && d_point.pos.y == pos.y - 1 {
            return Some(i);
        }
        if d_point.pos.x == pos.x + 1 && d_point.pos.y == pos.y {
            return Some(i);
        }
        if pos.x != 0 && d_point.pos.x == pos.x - 1 && d_point.pos.y == pos.y {
            return Some(i);
        }
    }
    None
}

/// Returns the index of the button adjacent to the given
/// position. Returns None if there is no adjacent button.
pub fn get_adjacent_button(state: &State, pos: &Pos) -> Option<usize> {
    for (i, button) in state.buttons.iter().enumerate() {
        if button.pos.x == pos.x && button.pos.y == pos.y + 1 {
            return Some(i);
        }
        if pos.y != 0 && button.pos.x == pos.x && button.pos.y == pos.y - 1 {
            return Some(i);
        }
        if button.pos.x == pos.x + 1 && button.pos.y == pos.y {
            return Some(i);
        }
        if pos.x != 0 && button.pos.x == pos.x - 1 && button.pos.y == pos.y {
            return Some(i);
        }
    }
    None
}

/// Teleportation pads instantly move a rover from one location to another.
/// As a side-effect, telepads may also change which direction the rover is
/// facing.
#[derive(Clone, PartialEq, Debug)]
pub struct Telepad {
    pub start_pos: Pos,
    pub end_pos: Pos,
    // The direction the rover will be facing after teleporting.
    pub end_facing: Orientation,
}

impl Telepad {
    pub fn new(start: (u32, u32), end: (u32, u32), end_facing: Orientation) -> Telepad {
        Telepad {
            start_pos: Pos::new(start.0 as i32, start.1 as i32),
            end_pos: Pos::new(end.0 as i32, end.1 as i32),
            end_facing,
        }
    }
}
