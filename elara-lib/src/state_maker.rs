use crate::simulation::{DataTerminal, Enemy, EnergyCell, Goal, Obstacle, Player, State, Telepad};

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

    pub fn with_data_terminal(&mut self, data_terminals: Vec<DataTerminal>) -> &mut Self {
        self.state.data_terminals = data_terminals;
        self
    }

    pub fn with_enemies(&mut self, enemies: Vec<Enemy>) -> &mut Self {
        self.state.enemies = enemies;
        self
    }

    pub fn with_telepads(&mut self, telepads: Vec<Telepad>) -> &mut Self {
        self.state.telepads = telepads;
        self
    }
}
