use crate::simulation::{Actor, State};
use std::cell::RefCell;
use std::cmp;
use std::rc::Rc;
use std::sync::mpsc;

use crate::constants::FUEL_SPOT_AMOUNT;
pub enum Action {
    Wait,
    Move(Direction),
}

pub struct Bounds {
    pub max_x: u32,
    pub max_y: u32,
}

pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

pub struct PlayerChannelActor {
    rx: Rc<RefCell<mpsc::Receiver<Action>>>,
    bounds: Bounds,
}

impl PlayerChannelActor {
    pub fn new(rx: Rc<RefCell<mpsc::Receiver<Action>>>, bounds: Bounds) -> PlayerChannelActor {
        PlayerChannelActor { rx, bounds }
    }
}

impl Actor for PlayerChannelActor {
    fn apply(&mut self, state: State) -> State {
        let mut state = state.clone();
        let rx = self.rx.clone();
        match rx.borrow().try_recv() {
            Ok(Action::Wait) => {}
            Ok(Action::Move(direction)) => {
                // We can't move if we're out of fuel.
                if state.player.fuel == 0 {
                    return state;
                }

                // Moving in any direction costs one fuel.
                state.player.fuel -= 1;

                match direction {
                    Direction::Up => {
                        if state.player.pos.y >= 1 {
                            state.player.pos.y -= 1;
                        }
                    }
                    Direction::Down => {
                        state.player.pos.y = cmp::min(state.player.pos.y + 1, self.bounds.max_y);
                    }
                    Direction::Left => {
                        if state.player.pos.x >= 1 {
                            state.player.pos.x -= 1;
                        }
                    }
                    Direction::Right => {
                        state.player.pos.x = cmp::min(state.player.pos.x + 1, self.bounds.max_x);
                    }
                }
            }
            Err(_) => {}
        }

        // If we're on a fuel spot *after moving*, increase our current fuel
        // and mark the fuel spot as collected.
        for (i, fuel_spot) in state.fuel_spots.iter().enumerate() {
            if fuel_spot.pos == state.player.pos && !fuel_spot.collected {
                state.player.fuel += FUEL_SPOT_AMOUNT;
                state.fuel_spots[i].collected = true;
                break;
            }
        }

        state
    }
}

#[cfg(test)]
mod test {
    // TODO(albrow): Unit test PlayerChannelActor.
}
