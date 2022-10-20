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

    pub fn reset(&mut self) {
        self.state_idx = 0;
        self.states.clear();
        self.states.push(self.level.initial_state().clone());
        self.last_outcome = Outcome::Continue;
        // TODO(albrow): May need to reset other actors here.
    }

    pub fn curr_state(&self) -> State {
        self.states[self.state_idx].clone()
    }

    pub fn get_history(&self) -> Vec<State> {
        self.states.to_vec()
    }

    pub fn last_outcome(&self) -> Outcome {
        self.last_outcome
    }

    pub fn step_forward(&mut self) -> Outcome {
        // If the current outcome is not Continue, then we can't take any more
        // steps forward. This happens if the player has already won or lost.
        if self.last_outcome != Outcome::Continue {
            return self.last_outcome;
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
                return self.last_outcome;
            }
            Outcome::Failure => {
                log!("You lose!");
                self.states.push(next_state);
                self.state_idx += 1;
                self.last_outcome = Outcome::Failure;
                return self.last_outcome;
            }
            Outcome::Continue => {}
        }
        // 3. Apply the other actors.
        for actor in &mut self.level.actors() {
            next_state = actor.apply(next_state);
        }

        // 4. Check for win or lose conditions again?
        //
        log!(
            "finished computing step {}: {:?}",
            self.state_idx,
            next_state
        );
        self.states.push(next_state);
        self.state_idx += 1;
        self.last_outcome
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct State {
    pub player: Player,
    pub fuel: Vec<Fuel>,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Player {
    pub pos: Pos,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Fuel {
    pub pos: Pos,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Pos {
    pub x: u32,
    pub y: u32,
}

impl State {
    pub fn new() -> State {
        State {
            player: Player {
                pos: Pos::new(0, 0),
            },
            fuel: vec![],
        }
    }
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
