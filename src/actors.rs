use crate::state::{Actor, Player, Pos, State};
use std::sync::mpsc;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

pub struct PlayerChannelActor {
    rx: &'static mpsc::Receiver<Direction>,
}

impl PlayerChannelActor {
    pub fn new(rx: &'static mpsc::Receiver<Direction>) -> PlayerChannelActor {
        PlayerChannelActor { rx }
    }
}

impl Actor for PlayerChannelActor {
    fn apply(&mut self, state: State) -> State {
        let mut new_x = state.player.pos.x;
        let mut new_y = state.player.pos.y;
        match self.rx.try_recv() {
            Ok(direction) => match direction {
                Direction::Up => new_y -= 1,
                Direction::Down => new_y += 1,
                Direction::Left => new_x -= 1,
                Direction::Right => new_x += 1,
            },
            Err(_) => (),
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
    // TODO(albrow): Test PlayerChannelActor and any other actors.
}
