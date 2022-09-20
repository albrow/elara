use crate::simulation::{Actor, Player, Pos, State};
use std::cmp;
use std::sync::mpsc;
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
    rx: &'static mpsc::Receiver<Action>,
    bounds: Bounds,
}

impl PlayerChannelActor {
    pub fn new(rx: &'static mpsc::Receiver<Action>, bounds: Bounds) -> PlayerChannelActor {
        PlayerChannelActor { rx, bounds }
    }
}

impl Actor for PlayerChannelActor {
    fn apply(&mut self, state: State) -> State {
        let mut new_x = state.player.pos.x;
        let mut new_y = state.player.pos.y;
        match self.rx.try_recv() {
            Ok(Action::Wait) => {}
            Ok(Action::Move(direction)) => match direction {
                Direction::Up => {
                    if new_y >= 1 {
                        new_y -= 1;
                    }
                }
                Direction::Down => {
                    new_y = cmp::min(new_y + 1, self.bounds.max_y);
                }
                Direction::Left => {
                    if new_x >= 1 {
                        new_x -= 1;
                    }
                }
                Direction::Right => {
                    new_x = cmp::min(new_x + 1, self.bounds.max_x);
                }
            },
            Err(_) => {}
        }
        State {
            player: Player {
                pos: Pos::new(new_x, new_y),
            },
        }
    }
}

#[cfg(test)]
mod test {
    // TODO(albrow): Unit test PlayerChannelActor.
}
