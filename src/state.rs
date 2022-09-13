use serde::{Deserialize, Serialize};

pub trait Actor {
    fn apply(&mut self, state: State) -> State;
}

pub struct StateEngine {
    state_idx: usize,
    states: Vec<State>,
    actors: Vec<Box<dyn Actor>>,
}

impl StateEngine {
    pub fn new() -> StateEngine {
        let state = State::new();
        StateEngine {
            state_idx: 0,
            states: vec![state],
            actors: vec![],
        }
    }

    pub fn curr_state(&self) -> &State {
        &self.states[self.state_idx]
    }

    pub fn add_actor(&mut self, actor: Box<dyn Actor>) {
        self.actors.push(actor);
    }

    pub fn step_forward(&mut self) {
        // If we have previously stored the state one step forward,
        // then just increment the index. I.e. we are re-using the
        // previously computed state.
        if self.state_idx < self.states.len() - 1 {
            self.state_idx += 1;
            return;
        }

        // Otherwise, compute the next state and store it.
        let mut next_state = self.curr_state().clone();
        for actor in &mut self.actors {
            next_state = actor.apply(next_state);
        }
        self.states.push(next_state);
        self.state_idx += 1;
    }

    pub fn step_back(&mut self) {
        if self.state_idx > 0 {
            self.state_idx -= 1;
        }
        // If we're already at the intiial state, do nothing.
    }
}

#[derive(Clone, PartialEq, Debug, Serialize, Deserialize)]
pub struct State {
    pub player: Player,
}

#[derive(Clone, PartialEq, Debug, Serialize, Deserialize)]
pub struct Player {
    pub pos: Pos,
}

#[derive(Clone, PartialEq, Debug, Serialize, Deserialize)]
pub struct Pos {
    pub x: u32,
    pub y: u32,
}

impl Pos {
    pub fn new(x: u32, y: u32) -> Pos {
        Pos { x, y }
    }
}

impl State {
    pub fn new() -> State {
        State {
            player: Player {
                pos: Pos::new(0, 0),
            },
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_state() {
        let state = State::new();
        assert_eq!(state.player.pos.x, 0);
        assert_eq!(state.player.pos.y, 0);
    }

    #[test]
    fn test_step_forward() {
        struct MoveRight;
        impl Actor for MoveRight {
            fn apply(&mut self, state: State) -> State {
                State {
                    player: Player {
                        pos: Pos::new(state.player.pos.x + 1, state.player.pos.y),
                    },
                }
            }
        }

        let mut engine = StateEngine::new();
        engine.add_actor(Box::new(MoveRight));
        engine.step_forward();

        let expected_state = State {
            player: Player {
                pos: Pos::new(1, 0),
            },
        };
        assert_eq!(engine.curr_state(), &expected_state);
    }

    #[test]
    fn test_step_back() {
        struct MoveRight;
        impl Actor for MoveRight {
            fn apply(&mut self, state: State) -> State {
                State {
                    player: Player {
                        pos: Pos::new(state.player.pos.x + 1, state.player.pos.y),
                    },
                }
            }
        }

        let mut engine = StateEngine::new();
        engine.add_actor(Box::new(MoveRight));

        engine.step_forward();
        engine.step_back();

        let expected_state = State {
            player: Player {
                pos: Pos::new(0, 0),
            },
        };
        assert_eq!(engine.curr_state(), &expected_state);
    }
}
