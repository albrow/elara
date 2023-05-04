use crate::simulation::{Actor, EnemyAnimState, Orientation, Pos, State, TeleAnimData};

use super::{
    get_telepad_at, is_closed_gate_at, is_obstacle_at, is_outside_bounds, Bounds, MoveDirection,
    TurnDirection,
};

/// An actor for "malfunctioning" or "evil" rover enemies which always tries to chase
/// the player down. It follows the same basic movement rules as the player but doesn't
/// have any fuel restrictions.
pub struct EvilRoverActor {
    /// The index in State.enemies of the enemy which will be controlled by
    /// this actor.
    index: usize,
    bounds: Bounds,
}

#[derive(Debug)]
enum EvilRoverAction {
    Move(MoveDirection),
    Turn(TurnDirection),
}

impl EvilRoverActor {
    pub fn new(index: usize, bounds: Bounds) -> EvilRoverActor {
        EvilRoverActor { index, bounds }
    }

    pub fn can_move(&self, state: &State, direction: Orientation) -> bool {
        let enemy = &state.enemies[self.index];
        let desired_pos = match direction {
            Orientation::Up => Pos::new(enemy.pos.x, enemy.pos.y - 1),
            Orientation::Down => Pos::new(enemy.pos.x, enemy.pos.y + 1),
            Orientation::Left => Pos::new(enemy.pos.x - 1, enemy.pos.y),
            Orientation::Right => Pos::new(enemy.pos.x + 1, enemy.pos.y),
        };
        !is_obstacle_at(&state, &desired_pos)
            && !is_outside_bounds(&self.bounds, &desired_pos)
            && !is_closed_gate_at(&state, &desired_pos)
    }

    fn get_next_action(&self, state: &State) -> EvilRoverAction {
        let player_pos = &state.player.pos;
        let enemy = &state.enemies[self.index];

        // Prioritize moving in the axis in which the player is the furthest away.
        let x_dist = player_pos.x.abs_diff(enemy.pos.x);
        let y_dist = player_pos.y.abs_diff(enemy.pos.y);
        if y_dist >= x_dist {
            if player_pos.y < enemy.pos.y {
                if self.can_move(state, Orientation::Up) {
                    if enemy.facing != Orientation::Up {
                        return EvilRoverAction::Turn(TurnDirection::Left);
                    }
                    return EvilRoverAction::Move(MoveDirection::Forward);
                }
            } else if player_pos.y > enemy.pos.y {
                if self.can_move(state, Orientation::Down) {
                    if enemy.facing != Orientation::Down {
                        return EvilRoverAction::Turn(TurnDirection::Left);
                    }
                    return EvilRoverAction::Move(MoveDirection::Forward);
                }
            }
            if player_pos.x < enemy.pos.x {
                if self.can_move(state, Orientation::Left) {
                    if enemy.facing != Orientation::Left {
                        return EvilRoverAction::Turn(TurnDirection::Left);
                    }
                    return EvilRoverAction::Move(MoveDirection::Forward);
                }
            } else if player_pos.x > enemy.pos.x {
                if self.can_move(state, Orientation::Right) {
                    if enemy.facing != Orientation::Right {
                        return EvilRoverAction::Turn(TurnDirection::Left);
                    }
                    return EvilRoverAction::Move(MoveDirection::Forward);
                }
            }
        } else {
            if player_pos.x < enemy.pos.x {
                if self.can_move(state, Orientation::Left) {
                    if enemy.facing != Orientation::Left {
                        return EvilRoverAction::Turn(TurnDirection::Left);
                    }
                    return EvilRoverAction::Move(MoveDirection::Forward);
                }
            } else if player_pos.x > enemy.pos.x {
                if self.can_move(state, Orientation::Right) {
                    if enemy.facing != Orientation::Right {
                        return EvilRoverAction::Turn(TurnDirection::Left);
                    }
                    return EvilRoverAction::Move(MoveDirection::Forward);
                }
            }
            if player_pos.y < enemy.pos.y {
                if self.can_move(state, Orientation::Up) {
                    if enemy.facing != Orientation::Up {
                        return EvilRoverAction::Turn(TurnDirection::Left);
                    }
                    return EvilRoverAction::Move(MoveDirection::Forward);
                }
            } else if player_pos.y > enemy.pos.y {
                if self.can_move(state, Orientation::Down) {
                    if enemy.facing != Orientation::Down {
                        return EvilRoverAction::Turn(TurnDirection::Left);
                    }
                    return EvilRoverAction::Move(MoveDirection::Forward);
                }
            }
        }
        return EvilRoverAction::Turn(TurnDirection::Left);
    }
}

impl Actor for EvilRoverActor {
    fn apply(&mut self, state: State) -> State {
        let mut state = state.clone();

        // Default to Idle state.
        state.enemies[self.index].anim_state = EnemyAnimState::Idle;

        // Update own state based on desired action.
        let action = self.get_next_action(&state);

        match action {
            EvilRoverAction::Move(direction) => {
                let desired_pos = match direction {
                    MoveDirection::Forward => match state.enemies[self.index].facing {
                        Orientation::Up => Pos::new(
                            state.enemies[self.index].pos.x,
                            state.enemies[self.index].pos.y - 1,
                        ),
                        Orientation::Down => Pos::new(
                            state.enemies[self.index].pos.x,
                            state.enemies[self.index].pos.y + 1,
                        ),
                        Orientation::Left => Pos::new(
                            state.enemies[self.index].pos.x - 1,
                            state.enemies[self.index].pos.y,
                        ),
                        Orientation::Right => Pos::new(
                            state.enemies[self.index].pos.x + 1,
                            state.enemies[self.index].pos.y,
                        ),
                    },
                    MoveDirection::Backward => match state.enemies[self.index].facing {
                        Orientation::Up => Pos::new(
                            state.enemies[self.index].pos.x,
                            state.enemies[self.index].pos.y + 1,
                        ),
                        Orientation::Down => Pos::new(
                            state.enemies[self.index].pos.x,
                            state.enemies[self.index].pos.y - 1,
                        ),
                        Orientation::Left => Pos::new(
                            state.enemies[self.index].pos.x + 1,
                            state.enemies[self.index].pos.y,
                        ),
                        Orientation::Right => Pos::new(
                            state.enemies[self.index].pos.x - 1,
                            state.enemies[self.index].pos.y,
                        ),
                    },
                };
                // If there is a telepad at the desired position, teleport.
                if let Some(telepad) = get_telepad_at(&state, &desired_pos) {
                    let anim_data = TeleAnimData {
                        start_pos: state.enemies[self.index].pos.clone(),
                        enter_pos: telepad.start_pos,
                        exit_pos: telepad.end_pos.clone(),
                    };
                    state.enemies[self.index].pos = telepad.end_pos.clone();
                    state.enemies[self.index].anim_state = EnemyAnimState::Teleporting(anim_data);
                    // TODO(albrow): This will make it so that enemies always face the same direction
                    // as players when going through a telepad. Is that what we want?
                    state.enemies[self.index].facing = telepad.end_facing;
                } else {
                    state.enemies[self.index].pos = desired_pos;
                    state.enemies[self.index].anim_state = EnemyAnimState::Moving;
                }
            }
            EvilRoverAction::Turn(direction) => match direction {
                TurnDirection::Left => {
                    state.enemies[self.index].anim_state = EnemyAnimState::Turning;
                    state.enemies[self.index].facing = match state.enemies[self.index].facing {
                        Orientation::Up => Orientation::Left,
                        Orientation::Down => Orientation::Right,
                        Orientation::Left => Orientation::Down,
                        Orientation::Right => Orientation::Up,
                    };
                }
                TurnDirection::Right => {
                    state.enemies[self.index].anim_state = EnemyAnimState::Turning;
                    state.enemies[self.index].facing = match state.enemies[self.index].facing {
                        Orientation::Up => Orientation::Right,
                        Orientation::Down => Orientation::Left,
                        Orientation::Left => Orientation::Up,
                        Orientation::Right => Orientation::Down,
                    };
                }
            },
        }

        state
    }
}
