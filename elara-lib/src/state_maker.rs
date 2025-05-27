use crate::simulation::{
    Asteroid, AsteroidWarning, BigEnemy, Button, Crate, DataPoint, Enemy, EnergyCell, Gate, Goal,
    Obstacle, PasswordGate, Player, State, Telepad,
};

/// A convenience struct for building a State via chainable
/// methods. This is useful for tests and for configuring initial
/// states for levels.
#[derive(Clone)]
pub struct StateMaker {
    state: State,
}

impl StateMaker {
    pub fn new() -> StateMaker {
        let state = State::new();
        StateMaker { state }
    }

    pub fn build(&self) -> State {
        self.state.clone()
    }

    pub fn with_player(&mut self, player: Player) -> &mut Self {
        self.state.player = player;
        self
    }

    pub fn with_obstacles(&mut self, obstacles: Vec<Obstacle>) -> &mut Self {
        self.state.obstacles = obstacles;
        self
    }

    pub fn with_goals(&mut self, goals: Vec<Goal>) -> &mut Self {
        self.state.goals = goals;
        self
    }

    pub fn with_energy_cells(&mut self, energy_cells: Vec<EnergyCell>) -> &mut Self {
        self.state.energy_cells = energy_cells;
        self
    }

    pub fn with_buttons(&mut self, buttons: Vec<Button>) -> &mut Self {
        self.state.buttons = buttons;
        self
    }

    pub fn with_gates(&mut self, gates: Vec<Gate>) -> &mut Self {
        self.state.gates = gates;
        self
    }

    pub fn with_password_gates(&mut self, password_gates: Vec<PasswordGate>) -> &mut Self {
        self.state.password_gates = password_gates;
        self
    }

    pub fn with_data_points(&mut self, data_points: Vec<DataPoint>) -> &mut Self {
        self.state.data_points = data_points;
        self
    }

    pub fn with_enemies(&mut self, enemies: Vec<Enemy>) -> &mut Self {
        self.state.enemies = enemies;
        self
    }

    #[allow(dead_code)]
    pub fn with_big_enemies(&mut self, big_enemies: Vec<BigEnemy>) -> &mut Self {
        self.state.big_enemies = big_enemies;
        self
    }

    pub fn with_telepads(&mut self, telepads: Vec<Telepad>) -> &mut Self {
        self.state.telepads = telepads;
        self
    }

    #[allow(dead_code)]
    pub fn with_crates(&mut self, crates: Vec<Crate>) -> &mut Self {
        self.state.crates = crates;
        self
    }

    #[allow(dead_code)]
    pub fn with_asteroid_warnings(&mut self, asteroid_warnings: Vec<AsteroidWarning>) -> &mut Self {
        self.state.asteroid_warnings = asteroid_warnings;
        self
    }

    #[allow(dead_code)]
    pub fn with_asteroids(&mut self, asteroids: Vec<Asteroid>) -> &mut Self {
        self.state.asteroids = asteroids;
        self
    }
}
