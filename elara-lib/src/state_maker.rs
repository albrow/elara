use crate::simulation::{Enemy, FuelSpot, Goal, Obstacle, Player, State, Telepad};

/// A convenience struct for building a State via chainable
/// methods. This is useful for tests and for configuring initial
/// states for levels.
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

    pub fn with_goal(&mut self, goal: Option<Goal>) -> &mut Self {
        self.state.goal = goal;
        self
    }

    pub fn with_fuel_spots(&mut self, fuel_spots: Vec<FuelSpot>) -> &mut Self {
        self.state.fuel_spots = fuel_spots;
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
