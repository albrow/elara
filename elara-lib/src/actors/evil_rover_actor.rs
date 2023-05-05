use crate::simulation::{Actor, EnemyAnimState, Orientation, Pos, State, TeleAnimData};

use super::{can_move_to, get_telepad_at, Bounds, MoveDirection, TurnDirection};

/// An actor for "malfunctioning" or "evil" rover enemies which always tries to chase
/// the player down. It follows the same basic movement rules as the player but doesn't
/// have any fuel restrictions.
pub struct EvilRoverActor {
    /// The index in State.enemies of the enemy which will be controlled by
    /// this actor.
    index: usize,
    bounds: Bounds,
}

#[derive(Debug, PartialEq)]
enum EvilRoverAction {
    Move(MoveDirection),
    Turn(TurnDirection),
}

impl EvilRoverActor {
    pub fn new(index: usize, bounds: Bounds) -> EvilRoverActor {
        EvilRoverActor { index, bounds }
    }

    /// Returns an action to either move forward or turn to face the desired
    /// direction.
    fn move_or_turn(
        &self,
        curr_orientation: Orientation,
        desired_direction: Orientation,
    ) -> EvilRoverAction {
        if curr_orientation == desired_direction {
            return EvilRoverAction::Move(MoveDirection::Forward);
        }
        let left_direction = match curr_orientation {
            Orientation::Up => Orientation::Left,
            Orientation::Down => Orientation::Right,
            Orientation::Left => Orientation::Down,
            Orientation::Right => Orientation::Up,
        };
        let right_direction = match curr_orientation {
            Orientation::Up => Orientation::Right,
            Orientation::Down => Orientation::Left,
            Orientation::Left => Orientation::Up,
            Orientation::Right => Orientation::Down,
        };
        if desired_direction == left_direction {
            return EvilRoverAction::Turn(TurnDirection::Left);
        }
        if desired_direction == right_direction {
            return EvilRoverAction::Turn(TurnDirection::Right);
        }
        // If we get here, we're facing the opposite direction.
        return EvilRoverAction::Turn(TurnDirection::Left);
    }

    fn get_next_action(&self, state: &State) -> EvilRoverAction {
        let player_pos = &state.player.pos;
        let enemy = &state.enemies[self.index];

        // Prioritize moving in the axis in which the player is the furthest away.
        let x_dist = player_pos.x.abs_diff(enemy.pos.x);
        let y_dist = player_pos.y.abs_diff(enemy.pos.y);
        if y_dist >= x_dist {
            if player_pos.y < enemy.pos.y {
                if can_move_to(state, &self.bounds, &Pos::new(enemy.pos.x, enemy.pos.y - 1)) {
                    return self.move_or_turn(enemy.facing, Orientation::Up);
                }
            } else if player_pos.y > enemy.pos.y {
                if can_move_to(state, &self.bounds, &Pos::new(enemy.pos.x, enemy.pos.y + 1)) {
                    return self.move_or_turn(enemy.facing, Orientation::Down);
                }
            }
            if player_pos.x < enemy.pos.x {
                if can_move_to(state, &self.bounds, &Pos::new(enemy.pos.x - 1, enemy.pos.y)) {
                    return self.move_or_turn(enemy.facing, Orientation::Left);
                }
            } else if player_pos.x > enemy.pos.x {
                if can_move_to(state, &self.bounds, &Pos::new(enemy.pos.x + 1, enemy.pos.y)) {
                    return self.move_or_turn(enemy.facing, Orientation::Right);
                }
            }
        } else {
            if player_pos.x < enemy.pos.x {
                if can_move_to(state, &self.bounds, &Pos::new(enemy.pos.x - 1, enemy.pos.y)) {
                    return self.move_or_turn(enemy.facing, Orientation::Left);
                }
            } else if player_pos.x > enemy.pos.x {
                if can_move_to(state, &self.bounds, &Pos::new(enemy.pos.x + 1, enemy.pos.y)) {
                    return self.move_or_turn(enemy.facing, Orientation::Right);
                }
            }
            if player_pos.y < enemy.pos.y {
                if can_move_to(state, &self.bounds, &Pos::new(enemy.pos.x, enemy.pos.y - 1)) {
                    return self.move_or_turn(enemy.facing, Orientation::Up);
                }
            } else if player_pos.y > enemy.pos.y {
                if can_move_to(state, &self.bounds, &Pos::new(enemy.pos.x, enemy.pos.y + 1)) {
                    return self.move_or_turn(enemy.facing, Orientation::Down);
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

#[cfg(test)]
mod test {
    use super::*;
    use crate::{
        constants::{HEIGHT, WIDTH},
        simulation::{Enemy, Player},
        state_maker::StateMaker,
    };

    #[test]
    fn get_next_action() {
        let mut base_state = StateMaker::new()
            .with_player(Player::new(3, 3, 0, Orientation::Up))
            .with_enemies(vec![Enemy::new(3, 4, Orientation::Up)])
            .build();
        let actor = EvilRoverActor::new(
            0,
            Bounds {
                min_x: 0,
                max_x: WIDTH as i32,
                min_y: 0,
                max_y: HEIGHT as i32,
            },
        );

        struct TestCase {
            enemy_pos: Pos,
            enemy_facing: Orientation,
            expected_action: EvilRoverAction,
        }
        let test_cases = vec![
            TestCase {
                // One space below player, facing up.
                enemy_pos: Pos::new(3, 4),
                enemy_facing: Orientation::Up,
                expected_action: EvilRoverAction::Move(MoveDirection::Forward),
            },
            TestCase {
                // One space below player, facing right.
                enemy_pos: Pos::new(3, 4),
                enemy_facing: Orientation::Right,
                expected_action: EvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                // One space below player, facing left.
                enemy_pos: Pos::new(3, 4),
                enemy_facing: Orientation::Left,
                expected_action: EvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                // One space above player, facing down.
                enemy_pos: Pos::new(3, 2),
                enemy_facing: Orientation::Down,
                expected_action: EvilRoverAction::Move(MoveDirection::Forward),
            },
            TestCase {
                // One space above player, facing right.
                enemy_pos: Pos::new(3, 2),
                enemy_facing: Orientation::Right,
                expected_action: EvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                // One space above player, facing left.
                enemy_pos: Pos::new(3, 2),
                enemy_facing: Orientation::Left,
                expected_action: EvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                // One space to the left of player, facing right.
                enemy_pos: Pos::new(2, 3),
                enemy_facing: Orientation::Right,
                expected_action: EvilRoverAction::Move(MoveDirection::Forward),
            },
            TestCase {
                // One space to the left of player, facing up.
                enemy_pos: Pos::new(2, 3),
                enemy_facing: Orientation::Up,
                expected_action: EvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                // One space to the left of player, facing down.
                enemy_pos: Pos::new(2, 3),
                enemy_facing: Orientation::Down,
                expected_action: EvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                // One space to the right of player, facing left.
                enemy_pos: Pos::new(4, 3),
                enemy_facing: Orientation::Left,
                expected_action: EvilRoverAction::Move(MoveDirection::Forward),
            },
            TestCase {
                // One space to the right of player, facing up.
                enemy_pos: Pos::new(4, 3),
                enemy_facing: Orientation::Up,
                expected_action: EvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                // One space to the right of player, facing down.
                enemy_pos: Pos::new(4, 3),
                enemy_facing: Orientation::Down,
                expected_action: EvilRoverAction::Turn(TurnDirection::Right),
            },
        ];
        for tc in test_cases {
            base_state.enemies[0].pos = tc.enemy_pos;
            base_state.enemies[0].facing = tc.enemy_facing;
            let action = actor.get_next_action(&base_state);
            assert_eq!(action, tc.expected_action);
        }
    }
}
