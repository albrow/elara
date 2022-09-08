use crate::state::{Actor, Player, Pos, State};
use rhai::{Engine, Func};

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

enum Direction {
    Up,
    Down,
    Left,
    Right,
}

pub struct PlayerScriptActor {
    script: String,
}

impl PlayerScriptActor {
    pub fn from_script(script: String) -> PlayerScriptActor {
        PlayerScriptActor { script }
    }
}

impl Actor for PlayerScriptActor {
    fn apply(&mut self, state: State) -> State {
        let engine = Engine::new();
        let func = Func::<(), String>::create_from_script(
            engine,               // the 'Engine' is consumed into the closure
            self.script.as_str(), // the script, notice number of parameters must match
            "main",               // the entry-point function name
        )
        .unwrap();

        let action = func().unwrap();

        let mut new_x = state.player.pos.x;
        let mut new_y = state.player.pos.y;
        match action.as_str() {
            "MOVE_UP" => new_y -= 1,
            "MOVE_DOWN" => new_y += 1,
            "MOVE_LEFT" => new_x -= 1,
            "MOVE_RIGHT" => new_x += 1,
            _ => panic!("Unknown action: {}", action),
        }
        State {
            player: Player {
                pos: Pos::new(new_x, new_y),
            },
        }
    }
}

pub struct PlayerMoveCircle {
    max_x: u32,
    max_y: u32,
    curr_direction: Direction,
}

impl PlayerMoveCircle {
    pub fn new(max_x: u32, max_y: u32) -> PlayerMoveCircle {
        PlayerMoveCircle {
            max_x,
            max_y,
            curr_direction: Direction::Right,
        }
    }
}

impl Actor for PlayerMoveCircle {
    fn apply(&mut self, state: State) -> State {
        let mut new_x = state.player.pos.x;
        let mut new_y = state.player.pos.y;
        match self.curr_direction {
            Direction::Right => {
                new_x += 1;
                if new_x >= self.max_x {
                    self.curr_direction = Direction::Down;
                }
            }
            Direction::Down => {
                new_y += 1;
                if new_y >= self.max_y {
                    self.curr_direction = Direction::Left;
                }
            }
            Direction::Left => {
                new_x -= 1;
                if new_x == 0 {
                    self.curr_direction = Direction::Up;
                }
            }
            Direction::Up => {
                new_y -= 1;
                if new_y == 0 {
                    self.curr_direction = Direction::Right;
                }
            }
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
    use super::*;
    use crate::state::{Config, StateEngine};

    #[test]
    fn test_player_move_circle() {
        let mut game = StateEngine::new(Config {
            width: 10,
            height: 10,
        });
        game.add_actor(Box::new(PlayerMoveCircle::new(2, 2)));

        // Should initially move right by one space.
        game.step_forward();
        let mut expected_state = State {
            player: Player {
                pos: Pos::new(1, 0),
            },
        };
        assert_eq!(game.curr_state(), &expected_state);

        // After one more step, should be in top right corner.
        game.step_forward();
        expected_state = State {
            player: Player {
                pos: Pos::new(2, 0),
            },
        };
        assert_eq!(game.curr_state(), &expected_state);

        // After two more steps, should be in bottom right corner.
        game.step_forward();
        game.step_forward();
        expected_state = State {
            player: Player {
                pos: Pos::new(2, 2),
            },
        };
        assert_eq!(game.curr_state(), &expected_state);

        // After two more steps, should be in bottom left corner.
        game.step_forward();
        game.step_forward();
        expected_state = State {
            player: Player {
                pos: Pos::new(0, 2),
            },
        };
        assert_eq!(game.curr_state(), &expected_state);

        // After two more steps forward, should be where we started.
        game.step_forward();
        game.step_forward();
        expected_state = State {
            player: Player {
                pos: Pos::new(0, 0),
            },
        };
        assert_eq!(game.curr_state(), &expected_state);

        // Two steps back should put us back in the bottom left corner.
        game.step_back();
        game.step_back();
        expected_state = State {
            player: Player {
                pos: Pos::new(0, 2),
            },
        };
        assert_eq!(game.curr_state(), &expected_state);

        // Two steps forward again should put is in the top left.
        game.step_forward();
        game.step_forward();
        expected_state = State {
            player: Player {
                pos: Pos::new(0, 0),
            },
        };
        assert_eq!(game.curr_state(), &expected_state);
    }
}
