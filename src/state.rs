use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::wasm_bindgen;

pub trait Actor {
    fn apply(&mut self, state: State) -> State;
}

pub type SharedState = Rc<RefCell<State>>;

pub struct StateEngine {
    state_idx: usize,
    states: Vec<SharedState>,
    actors: Vec<Box<dyn Actor>>,
}

impl StateEngine {
    pub fn new() -> StateEngine {
        let state = Rc::new(RefCell::new(State::new()));
        StateEngine {
            state_idx: 0,
            states: vec![state],
            actors: vec![],
        }
    }

    pub fn curr_state(&self) -> SharedState {
        self.states[self.state_idx].clone()
    }

    pub fn all_states(&self) -> &[SharedState] {
        &self.states
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
        let mut next_state = *self.curr_state().clone().borrow_mut();
        for actor in &mut self.actors {
            next_state = actor.apply(next_state);
        }
        self.states.push(Rc::new(RefCell::new(next_state)));
        self.state_idx += 1;
    }

    pub fn step_back(&mut self) {
        if self.state_idx > 0 {
            self.state_idx -= 1;
        }
        // If we're already at the intiial state, do nothing.
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct State {
    pub player: Player,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Player {
    pub pos: Pos,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Debug)]
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
        }
    }

    pub fn get_player(&mut self) -> Player {
        self.player.clone()
    }
}

impl Player {
    pub fn get_pos(&mut self) -> Pos {
        // Property getters are assumed to be PURE, meaning they are
        // not supposed to mutate any data.
        self.pos.clone()
    }
}

impl Pos {
    pub fn new(x: u32, y: u32) -> Pos {
        Pos { x, y }
    }

    pub fn get_x(&mut self) -> u32 {
        self.x
    }

    pub fn get_y(&mut self) -> u32 {
        self.y
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
