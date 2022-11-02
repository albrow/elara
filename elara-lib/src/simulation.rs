use std::fmt;

use crate::levels::{Level, Outcome};

pub trait Actor {
    fn apply(&mut self, state: State) -> State;
}

pub struct Simulation {
    state_idx: usize,
    states: Vec<State>,
    player_actor: Box<dyn Actor>,
    level: &'static dyn Level,
    last_outcome: Outcome,
}

impl Simulation {
    pub fn new(level: &'static dyn Level, player_actor: Box<dyn Actor>) -> Simulation {
        let sim = Simulation {
            state_idx: 0,
            states: vec![level.initial_state().clone()],
            player_actor: player_actor,
            level,
            last_outcome: Outcome::Continue,
        };
        sim
    }

    pub fn load_level(&mut self, level: &'static dyn Level) {
        self.level = level;
        self.state_idx = 0;
        self.states.clear();
        self.states.push(self.level.initial_state().clone());
        self.last_outcome = Outcome::Continue;
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
        if self.last_outcome != Outcome::Continue {
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
                log!("You win!");
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Success;
                return outcome;
            }
            Outcome::Failure(msg) => {
                log!("Failure: {}", msg);
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Failure(msg.clone());
                return self.last_outcome.clone();
            }
            Outcome::Continue => {}
        }
        // 3. Apply the other actors.
        for actor in &mut self.level.actors() {
            next_state = actor.apply(next_state);
        }
        // 4. Check for win or lose conditions again.
        let outcome = self.level.check_win(&next_state);
        match outcome {
            Outcome::Success => {
                log!("You win!");
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Success;
                return outcome;
            }
            Outcome::Failure(msg) => {
                log!("Failure: {}", msg);
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Failure(msg.clone());
                return self.last_outcome.clone();
            }
            Outcome::Continue => {}
        }

        log!(
            "finished computing step {}: {:?}",
            self.state_idx,
            next_state
        );
        self.states.push(next_state);
        self.state_idx += 1;
        self.last_outcome.clone()
    }
}

#[derive(Clone, PartialEq)]
pub struct State {
    pub player: Player,
    pub fuel_spots: Vec<FuelSpot>,
    pub goal: Goal,
    pub enemies: Vec<Enemy>,
    pub obstacles: Vec<Obstacle>,
}

impl fmt::Debug for State {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("State")
            .field("player", &self.player)
            .field("fuel_spots", &self.fuel_spots)
            .field("goal", &self.goal)
            .field("enemies", &self.enemies)
            // Omitting obstacles field since it can be very long and
            // the obstacles never move.
            // .field("obstacles", &self.obstacles)
            .finish()
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Player {
    pub pos: Pos,
    pub fuel: u32,
}

#[derive(Clone, PartialEq, Debug)]
pub struct FuelSpot {
    pub pos: Pos,
    pub collected: bool,
}

impl FuelSpot {
    pub fn new(x: u32, y: u32) -> FuelSpot {
        FuelSpot {
            pos: Pos { x, y },
            collected: false,
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Goal {
    pub pos: Pos,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Enemy {
    pub pos: Pos,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Obstacle {
    pub pos: Pos,
    // TODO(albrow): Make some obstacles destructible?
}

impl Obstacle {
    pub fn new(x: u32, y: u32) -> Obstacle {
        Obstacle { pos: Pos { x, y } }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Pos {
    pub x: u32,
    pub y: u32,
}

impl Pos {
    pub fn new(x: u32, y: u32) -> Pos {
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

#[cfg(test)]
mod test {
    // use super::*;

    // #[test]
    // fn test_state() {
    //     let state = State::new();
    //     assert_eq!(state.player.pos.x, 0);
    //     assert_eq!(state.player.pos.y, 0);
    // }

    // #[test]
    // fn test_step_forward() {
    //     struct MoveRight;
    //     impl Actor for MoveRight {
    //         fn apply(&mut self, state: State) -> State {
    //             State {
    //                 player: Player {
    //                     pos: Pos::new(state.player.pos.x + 1, state.player.pos.y),
    //                 },
    //             }
    //         }
    //     }

    //     let mut engine = StateEngine::new();
    //     engine.add_actor(Box::new(MoveRight));
    //     engine.step_forward();

    //     let expected_state = State {
    //         player: Player {
    //             pos: Pos::new(1, 0),
    //         },
    //     };
    //     assert_eq!(engine.curr_state(), &expected_state);
    // }

    // #[test]
    // fn test_step_back() {
    //     struct MoveRight;
    //     impl Actor for MoveRight {
    //         fn apply(&mut self, state: State) -> State {
    //             State {
    //                 player: Player {
    //                     pos: Pos::new(state.player.pos.x + 1, state.player.pos.y),
    //                 },
    //             }
    //         }
    //     }

    //     let mut engine = StateEngine::new();
    //     engine.add_actor(Box::new(MoveRight));

    //     engine.step_forward();
    //     engine.step_back();

    //     let expected_state = State {
    //         player: Player {
    //             pos: Pos::new(0, 0),
    //         },
    //     };
    //     assert_eq!(engine.curr_state(), &expected_state);
    // }
}
