use rhai::Dynamic;
use std::any::Any;
use std::fmt;

use crate::{
    actors::PlayerChannelActor,
    constants::MAX_ENERGY,
    levels::{Level, Outcome, LEVELS},
};

pub trait Actor {
    fn apply(&mut self, state: State) -> State;

    fn as_any(&self) -> &dyn Any;
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
            player_actor,
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
    pub crates: Vec<Crate>,
    pub asteroid_warnings: Vec<AsteroidWarning>,
    pub asteroids: Vec<Asteroid>,
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
            crates: vec![],
            asteroid_warnings: vec![],
            asteroids: vec![],
        }
    }
}

impl Default for State {
    fn default() -> Self {
        Self::new()
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
            .field("crates", &self.crates)
            .field("asteroid_warnings", &self.asteroid_warnings)
            .field("asteroids", &self.asteroids)
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
    pub fn flip(&self) -> Self {
        match self {
            Orientation::Up => Orientation::Down,
            Orientation::Down => Orientation::Up,
            Orientation::Left => Orientation::Right,
            Orientation::Right => Orientation::Left,
        }
    }

    pub fn rotate_clockwise(&self) -> Self {
        match self {
            Orientation::Up => Orientation::Right,
            Orientation::Down => Orientation::Left,
            Orientation::Left => Orientation::Up,
            Orientation::Right => Orientation::Down,
        }
    }

    pub fn rotate_counter_clockwise(&self) -> Self {
        match self {
            Orientation::Up => Orientation::Left,
            Orientation::Down => Orientation::Right,
            Orientation::Left => Orientation::Down,
            Orientation::Right => Orientation::Up,
        }
    }
}

#[derive(Clone, PartialEq, Debug, Copy)]
pub enum OrientationWithDiagonals {
    Up,
    Down,
    Left,
    Right,
    UpLeft,
    UpRight,
    DownLeft,
    DownRight,
}

impl OrientationWithDiagonals {
    pub fn rotate_clockwise(&self) -> Self {
        match self {
            OrientationWithDiagonals::Up => OrientationWithDiagonals::UpRight,
            OrientationWithDiagonals::Down => OrientationWithDiagonals::DownLeft,
            OrientationWithDiagonals::Left => OrientationWithDiagonals::UpLeft,
            OrientationWithDiagonals::Right => OrientationWithDiagonals::DownRight,
            OrientationWithDiagonals::UpLeft => OrientationWithDiagonals::Up,
            OrientationWithDiagonals::UpRight => OrientationWithDiagonals::Right,
            OrientationWithDiagonals::DownLeft => OrientationWithDiagonals::Left,
            OrientationWithDiagonals::DownRight => OrientationWithDiagonals::Down,
        }
    }

    pub fn rotate_counter_clockwise(&self) -> Self {
        match self {
            OrientationWithDiagonals::Up => OrientationWithDiagonals::UpLeft,
            OrientationWithDiagonals::Down => OrientationWithDiagonals::DownRight,
            OrientationWithDiagonals::Left => OrientationWithDiagonals::DownLeft,
            OrientationWithDiagonals::Right => OrientationWithDiagonals::UpRight,
            OrientationWithDiagonals::UpLeft => OrientationWithDiagonals::Left,
            OrientationWithDiagonals::UpRight => OrientationWithDiagonals::Up,
            OrientationWithDiagonals::DownLeft => OrientationWithDiagonals::Down,
            OrientationWithDiagonals::DownRight => OrientationWithDiagonals::Right,
        }
    }

    pub fn clockwise_distance(&self, other: &Self) -> usize {
        let mut curr = *self;
        let mut dist = 0;
        while curr != *other {
            curr = curr.rotate_clockwise();
            dist += 1;
        }
        dist
    }

    pub fn counter_clockwise_distance(&self, other: &Self) -> usize {
        let mut curr = *self;
        let mut dist = 0;
        while curr != *other {
            curr = curr.rotate_counter_clockwise();
            dist += 1;
        }
        dist
    }

    pub fn is_diagonal(&self) -> bool {
        matches!(
            self,
            OrientationWithDiagonals::UpLeft
                | OrientationWithDiagonals::UpRight
                | OrientationWithDiagonals::DownLeft
                | OrientationWithDiagonals::DownRight
        )
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
    PickingUp,
    Dropping,
    DropBumping(BumpAnimData),
}

#[derive(Clone, PartialEq, Debug)]
pub struct TeleAnimData {
    pub start_pos: Pos, // The position of the rover before entering telepad.
    pub enter_pos: Pos, // The position of the telepad entrance.
    pub exit_pos: Pos,  // The position of the telepad exit.
}

#[derive(Clone, PartialEq, Debug)]
pub struct BumpAnimData {
    pub pos: Pos,          // The position of the rover/crate.
    pub obstacle_pos: Pos, // The position of the obstacle the rover/crate is bumping into.
}

#[derive(Clone, PartialEq, Debug)]
pub struct Player {
    pub pos: Pos,
    pub energy: u32,
    pub message: String,
    /// Used to convey certain runtime errors to the player (e.g. trying to pick
    /// something up when already holding something)
    pub err_message: String,
    pub anim_state: PlayerAnimState,
    pub facing: Orientation,
    pub total_energy_used: u32,
    /// The index of the crate being held by the player, if any.
    pub held_crate_index: Option<usize>,
}

impl Player {
    pub fn new(x: u32, y: u32, energy: u32, facing: Orientation) -> Player {
        Player {
            pos: Pos::new(x as i32, y as i32),
            energy,
            message: String::new(),
            err_message: String::new(),
            anim_state: PlayerAnimState::Idle,
            facing,
            total_energy_used: 0,
            held_crate_index: None,
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
            connection,
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
    /// The position of the top left corner of the enemy.
    pub pos: Pos,
    pub facing: OrientationWithDiagonals,
    pub anim_state: BigEnemyAnimState,
}

impl BigEnemy {
    pub fn new(x: u32, y: u32, facing: OrientationWithDiagonals) -> BigEnemy {
        BigEnemy {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            facing,
            anim_state: BigEnemyAnimState::Idle,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
/// The kind of obstacle. This determines how the obstacle is drawn, but
/// doesn't affect the behavior of the simulation.
pub enum ObstacleKind {
    Rock,
    Server,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Obstacle {
    pub pos: Pos,
    pub kind: ObstacleKind,
}

impl Obstacle {
    /// Creates a new obstacle with the default kind (Rock).
    pub fn new(x: u32, y: u32) -> Obstacle {
        Obstacle {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            kind: ObstacleKind::Rock,
        }
    }

    /// Creates a new obstacle with the given kind.
    pub fn new_with_kind(x: u32, y: u32, kind: ObstacleKind) -> Obstacle {
        Obstacle {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            kind,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub enum AsteroidAnimState {
    /// The asteroid is currently falling from the sky.
    Falling,
    /// The asteroid just hit the ground 1 step ago.
    RecentlyHitGround,
    /// The asteroid hit the ground more than 1 step ago and is now stationary.
    Stationary,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Asteroid {
    pub pos: Pos,
    pub anim_state: AsteroidAnimState,
}

impl Asteroid {
    pub fn new(x: u32, y: u32, anim_state: AsteroidAnimState) -> Asteroid {
        Asteroid {
            pos: Pos::new(x as i32, y as i32),
            anim_state,
        }
    }
}

#[derive(Clone, PartialEq, Debug, Hash, Eq)]
/// An asteroid warning is a position where an asteroid may potentially hit.
/// If an asteroid will hit here, the warning will be replaced with an asteroid after
/// a certain number of steps.
/// If an asteroid will not hit here, the warning will be replaced with an empty space.
///
/// Typically, multiple AsteroidWarnings would be placed in a single level with multiple
/// initial states. Different asteroids would hit in different states, which appears to
/// the player as a random event.
pub struct AsteroidWarning {
    pub pos: Pos,
    /// The number of steps until the asteroid hits the ground.
    pub steps_until_impact: u32,
    /// Whether or not an asteroid will hit here.
    pub will_hit: bool,
}

impl AsteroidWarning {
    pub fn new(x: u32, y: u32, steps_until_impact: u32, hit: bool) -> AsteroidWarning {
        AsteroidWarning {
            pos: Pos::new(x as i32, y as i32),
            steps_until_impact,
            will_hit: hit,
        }
    }
}

#[allow(clippy::upper_case_acronyms)]
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
    // An indicator of whether the player has said the wrong password
    // in the current step of the simulation.
    pub wrong_password: bool,
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
            wrong_password: false,
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
            wrong_password: false,
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

#[derive(Clone, PartialEq, Debug, Hash, Eq)]
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

/// Returns the index of the crate directly in front of the player,
/// or None if there is no crate in front of the player.
pub fn get_crate_in_front(state: &State) -> Option<usize> {
    let player = &state.player;
    let mut pos = player.pos.clone();
    match player.facing {
        Orientation::Up => pos.y -= 1,
        Orientation::Down => pos.y += 1,
        Orientation::Left => pos.x -= 1,
        Orientation::Right => pos.x += 1,
    }
    for (i, crt) in state.crates.iter().enumerate() {
        if crt.pos == pos {
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

#[derive(Clone, PartialEq, Debug)]
pub enum CrateColor {
    Red,
    Blue,
    Green,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Crate {
    pub pos: Pos,
    pub held: bool,
    pub color: CrateColor,
}

impl Crate {
    pub fn new(x: u32, y: u32, color: CrateColor) -> Crate {
        Crate {
            pos: Pos {
                x: x as i32,
                y: y as i32,
            },
            held: false,
            color,
        }
    }
}
