use std::cell::RefCell;
use std::rc::Rc;
use std::sync::mpsc;

use crate::constants::FUEL_SPOT_AMOUNT;
use crate::simulation::{Actor, Pos, State};

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

                state.player.pos = self.get_new_player_pos(&state, direction);
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

impl PlayerChannelActor {
    fn get_new_player_pos(&self, state: &State, direction: Direction) -> Pos {
        let desired_pos = match direction {
            Direction::Up => Pos::new(state.player.pos.x, safe_decrement(state.player.pos.y)),
            Direction::Down => Pos::new(state.player.pos.x, state.player.pos.y + 1),
            Direction::Left => Pos::new(safe_decrement(state.player.pos.x), state.player.pos.y),
            Direction::Right => Pos::new(state.player.pos.x + 1, state.player.pos.y),
        };
        if is_obstacle_at(state, &desired_pos) || is_outside_bounds(&self.bounds, &desired_pos) {
            state.player.pos.clone()
        } else {
            desired_pos
        }
    }
}

/// A simple actor for "bug" enemies which always try to move closer to
/// the player and do not do any path finding.
pub struct EnemyBugActor {
    /// The index in State.enemies of the enemy which will be constrolled by
    /// this actor.
    index: usize,
    bounds: Bounds,
}

impl EnemyBugActor {
    pub fn new(index: usize, bounds: Bounds) -> EnemyBugActor {
        EnemyBugActor { index, bounds }
    }

    pub fn closer_pos_x(&self, enemy_pos: &Pos, player_pos: &Pos) -> Pos {
        if player_pos.x > enemy_pos.x {
            Pos::new(enemy_pos.x + 1, enemy_pos.y)
        } else if player_pos.x < enemy_pos.x {
            Pos::new(safe_decrement(enemy_pos.x), enemy_pos.y)
        } else {
            enemy_pos.clone()
        }
    }

    pub fn closer_pos_y(&self, enemy_pos: &Pos, player_pos: &Pos) -> Pos {
        if player_pos.y > enemy_pos.y {
            Pos::new(enemy_pos.x, enemy_pos.y + 1)
        } else if player_pos.y < enemy_pos.y {
            Pos::new(enemy_pos.x, safe_decrement(enemy_pos.y))
        } else {
            enemy_pos.clone()
        }
    }
}

impl Actor for EnemyBugActor {
    fn apply(&mut self, state: State) -> State {
        let mut state = state.clone();

        let player_pos = &state.player.pos;
        let enemy_pos = &state.enemies[self.index].pos;

        // Create an array of possible new positions for the enemy.
        // Prioritize moving in the axis in which the player is the furthest away.
        let x_dist = player_pos.x.abs_diff(enemy_pos.x);
        let y_dist = player_pos.y.abs_diff(enemy_pos.y);
        let mut possible_positions = vec![];
        if x_dist >= y_dist {
            possible_positions.push(self.closer_pos_x(enemy_pos, player_pos));
            possible_positions.push(self.closer_pos_y(enemy_pos, player_pos));
        } else {
            possible_positions.push(self.closer_pos_y(enemy_pos, player_pos));
            possible_positions.push(self.closer_pos_x(enemy_pos, player_pos));
        }

        // Iterate through possible positions and apply the first one which is unobstructed.
        for pos in possible_positions {
            if !is_obstacle_at(&state, &pos) && !is_outside_bounds(&self.bounds, &pos) {
                state.enemies[self.index].pos = pos;
                break;
            }
        }

        state
    }
}

/// Decrements x unless the result would be negative, in which case it returns 0.
fn safe_decrement(x: u32) -> u32 {
    if x == 0 {
        0
    } else {
        x - 1
    }
}

fn is_obstacle_at(state: &State, pos: &Pos) -> bool {
    for obstacle in &state.obstacles {
        if obstacle.pos == *pos {
            return true;
        }
    }
    false
}

fn is_outside_bounds(bounds: &Bounds, pos: &Pos) -> bool {
    pos.x > bounds.max_x || pos.y > bounds.max_y
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{
        constants::MAX_FUEL,
        simulation::{Goal, Obstacle, Player, Pos, State},
    };

    #[test]
    fn test_get_new_player_pos() {
        let bounds = Bounds { max_x: 2, max_y: 2 };
        let actor = PlayerChannelActor::new(Rc::new(RefCell::new(mpsc::channel().1)), bounds);
        let mut state = State {
            player: Player {
                pos: Pos::new(1, 1),
                fuel: MAX_FUEL,
            },
            fuel_spots: vec![],
            obstacles: vec![],
            enemies: vec![],
            goal: Goal {
                pos: Pos::new(3, 3),
            },
        };

        // Simple case where no obstacles are in the way and we are not
        // outside the bounds.
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Up),
            Pos::new(1, 0)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Down),
            Pos::new(1, 2)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Left),
            Pos::new(0, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Right),
            Pos::new(2, 1)
        );

        // We can't move outside the bounds.
        state.player.pos = Pos::new(0, 0);
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Up),
            Pos::new(0, 0)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Left),
            Pos::new(0, 0)
        );
        state.player.pos = Pos::new(2, 2);
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Down),
            Pos::new(2, 2)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Right),
            Pos::new(2, 2)
        );

        // We can't move past obstacles.
        state.player.pos = Pos::new(1, 1);
        state.obstacles = vec![
            Obstacle {
                pos: Pos::new(0, 0),
            },
            Obstacle {
                pos: Pos::new(1, 0),
            },
            Obstacle {
                pos: Pos::new(2, 0),
            },
            Obstacle {
                pos: Pos::new(2, 1),
            },
            Obstacle {
                pos: Pos::new(2, 2),
            },
            Obstacle {
                pos: Pos::new(1, 2),
            },
            Obstacle {
                pos: Pos::new(0, 2),
            },
            Obstacle {
                pos: Pos::new(0, 1),
            },
        ];
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Up),
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Left),
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Down),
            Pos::new(1, 1)
        );
        assert_eq!(
            actor.get_new_player_pos(&state, Direction::Right),
            Pos::new(1, 1)
        );
    }
}
