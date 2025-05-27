use std::any::Any;

use crate::simulation::{
    Actor, BigEnemyAnimState, BumpAnimData, OrientationWithDiagonals, Pos, State,
};

use super::{can_move_to, Bounds, MoveDirection, TurnDirection};

pub const BIG_ENEMY_SIZE: i32 = 3;

/// An actor for a much larger "malfunctioning" rover enemies which takes up a 3x3 grid.
/// Similar to the smaller malfunctioning rovers, it always tries to chase
/// the player down and follows the same general movement patterns, but it does take
/// twice as long to turn.
pub struct BigEnemyActor {
    /// The index in State.big_enemies of the enemy which will be controlled by
    /// this actor.
    index: usize,
    bounds: Bounds,
}

#[derive(Debug, PartialEq)]
enum BigEvilRoverAction {
    Move(MoveDirection),
    Turn(TurnDirection),
    Bump(Pos),
}

/// Returns true if we can move to the desired position. Accounts for the entire
/// body of the enemy, not just one space.
fn can_move_entire_body(state: &State, bounds: &Bounds, desired_pos: &Pos) -> bool {
    for x in desired_pos.x..desired_pos.x + BIG_ENEMY_SIZE {
        for y in desired_pos.y..desired_pos.y + BIG_ENEMY_SIZE {
            if !can_move_to(state, bounds, &Pos::new(x, y)) {
                return false;
            }
        }
    }
    true
}

impl BigEnemyActor {
    pub fn new(index: usize, bounds: Bounds) -> BigEnemyActor {
        BigEnemyActor { index, bounds }
    }

    /// Returns the position that is one space in front of the enemy.
    /// If the enemy is facing diagonally, returns None.
    fn forward_pos(&self, state: &State) -> Option<Pos> {
        match state.big_enemies[self.index].facing {
            OrientationWithDiagonals::Up => Some(Pos::new(
                state.big_enemies[self.index].pos.x,
                state.big_enemies[self.index].pos.y - 1,
            )),
            OrientationWithDiagonals::Down => Some(Pos::new(
                state.big_enemies[self.index].pos.x,
                state.big_enemies[self.index].pos.y + 1,
            )),
            OrientationWithDiagonals::Left => Some(Pos::new(
                state.big_enemies[self.index].pos.x - 1,
                state.big_enemies[self.index].pos.y,
            )),
            OrientationWithDiagonals::Right => Some(Pos::new(
                state.big_enemies[self.index].pos.x + 1,
                state.big_enemies[self.index].pos.y,
            )),
            _ => None,
        }
    }

    /// Returns the position that is one space behind the enemy.
    /// If the enemy is facing diagonally, returns None.
    fn backward_pos(&self, state: &State) -> Option<Pos> {
        match state.big_enemies[self.index].facing {
            OrientationWithDiagonals::Up => Some(Pos::new(
                state.big_enemies[self.index].pos.x,
                state.big_enemies[self.index].pos.y + 1,
            )),
            OrientationWithDiagonals::Down => Some(Pos::new(
                state.big_enemies[self.index].pos.x,
                state.big_enemies[self.index].pos.y - 1,
            )),
            OrientationWithDiagonals::Left => Some(Pos::new(
                state.big_enemies[self.index].pos.x + 1,
                state.big_enemies[self.index].pos.y,
            )),
            OrientationWithDiagonals::Right => Some(Pos::new(
                state.big_enemies[self.index].pos.x - 1,
                state.big_enemies[self.index].pos.y,
            )),
            _ => None,
        }
    }

    /// Returns an action to either move forward or turn to face the desired
    /// direction.
    fn move_or_turn(
        &self,
        curr_orientation: OrientationWithDiagonals,
        desired_direction: OrientationWithDiagonals,
    ) -> BigEvilRoverAction {
        if desired_direction.is_diagonal() {
            panic!("desired_direction cannot be diagonal");
        }
        if curr_orientation == desired_direction {
            return BigEvilRoverAction::Move(MoveDirection::Forward);
        }
        println!("desired_direction: {:?}", desired_direction);
        let clockwise_dist = curr_orientation.clockwise_distance(&desired_direction);
        let counter_clockwise_dist =
            curr_orientation.counter_clockwise_distance(&desired_direction);
        println!(
            "clockwise_dist: {}, counter_clockwise_dist: {}",
            clockwise_dist, counter_clockwise_dist
        );
        if clockwise_dist < counter_clockwise_dist {
            BigEvilRoverAction::Turn(TurnDirection::Right)
        } else {
            BigEvilRoverAction::Turn(TurnDirection::Left)
        }
    }

    /// Returns an action to turn to face the desired direction, or
    /// if we are already facing that direction, to do a bump animation.
    fn bump_or_turn(
        &self,
        state: &State,
        curr_orientation: OrientationWithDiagonals,
        desired_direction: OrientationWithDiagonals,
    ) -> BigEvilRoverAction {
        assert!(
            !desired_direction.is_diagonal(),
            "desired_direction cannot be diagonal"
        );
        if curr_orientation == desired_direction {
            // Should be safe to unwrap at this point since we know desired_direction
            // is not diagonal.
            return BigEvilRoverAction::Bump(self.forward_pos(state).unwrap());
        }
        let clockwise_dist = curr_orientation.clockwise_distance(&desired_direction);
        let counter_clockwise_dist =
            curr_orientation.counter_clockwise_distance(&desired_direction);
        if clockwise_dist < counter_clockwise_dist {
            BigEvilRoverAction::Turn(TurnDirection::Right)
        } else {
            BigEvilRoverAction::Turn(TurnDirection::Left)
        }
    }

    fn get_next_action(&self, state: &State) -> BigEvilRoverAction {
        let player_pos = &state.player.pos;
        let enemy = &state.big_enemies[self.index];
        // Note: BigEnemy.pos represents the top-left position (which is easier
        // for drawing sprites on the screen), but when we are figuring out which
        // way to move, it's better to consider the center position.
        let center_pos = Pos::new(
            enemy.pos.x + BIG_ENEMY_SIZE / 2,
            enemy.pos.y + BIG_ENEMY_SIZE / 2,
        );

        // Prioritize moving in the axis in which the player is the furthest away.
        let x_dist = player_pos.x.abs_diff(center_pos.x);
        let y_dist = player_pos.y.abs_diff(center_pos.y);
        if y_dist >= x_dist {
            if player_pos.y < center_pos.y
                && can_move_entire_body(
                    state,
                    &self.bounds,
                    &Pos::new(enemy.pos.x, enemy.pos.y - 1),
                )
            {
                return self.move_or_turn(enemy.facing, OrientationWithDiagonals::Up);
            } else if player_pos.y > center_pos.y
                && can_move_entire_body(
                    state,
                    &self.bounds,
                    &Pos::new(enemy.pos.x, enemy.pos.y + 1),
                )
            {
                return self.move_or_turn(enemy.facing, OrientationWithDiagonals::Down);
            }

            if player_pos.x < center_pos.x
                && can_move_entire_body(
                    state,
                    &self.bounds,
                    &Pos::new(enemy.pos.x - 1, enemy.pos.y),
                )
            {
                return self.move_or_turn(enemy.facing, OrientationWithDiagonals::Left);
            } else if player_pos.x > center_pos.x
                && can_move_entire_body(
                    state,
                    &self.bounds,
                    &Pos::new(enemy.pos.x + 1, enemy.pos.y),
                )
            {
                return self.move_or_turn(enemy.facing, OrientationWithDiagonals::Right);
            }

            // If we get here, we can't move toward the player. This means we should at least
            // turn toward the player (if we are not already facing them). If we are facing them,
            // we should do a bump animation. Note that we only need to check the y-axis here
            // since we know that is the axis in which the player is furthest away.
            if player_pos.y < center_pos.y {
                self.bump_or_turn(state, enemy.facing, OrientationWithDiagonals::Up)
            } else {
                self.bump_or_turn(state, enemy.facing, OrientationWithDiagonals::Down)
            }
        } else {
            // The player is further away in the x-axis, so we prioritize that while checking
            // movement options.
            if player_pos.x < center_pos.x
                && can_move_entire_body(
                    state,
                    &self.bounds,
                    &Pos::new(enemy.pos.x - 1, enemy.pos.y),
                )
            {
                return self.move_or_turn(enemy.facing, OrientationWithDiagonals::Left);
            } else if player_pos.x > center_pos.x
                && can_move_entire_body(
                    state,
                    &self.bounds,
                    &Pos::new(enemy.pos.x + 1, enemy.pos.y),
                )
            {
                return self.move_or_turn(enemy.facing, OrientationWithDiagonals::Right);
            }

            if player_pos.y < center_pos.y
                && can_move_entire_body(
                    state,
                    &self.bounds,
                    &Pos::new(enemy.pos.x, enemy.pos.y - 1),
                )
            {
                return self.move_or_turn(enemy.facing, OrientationWithDiagonals::Up);
            } else if player_pos.y > center_pos.y
                && can_move_entire_body(
                    state,
                    &self.bounds,
                    &Pos::new(enemy.pos.x, enemy.pos.y + 1),
                )
            {
                return self.move_or_turn(enemy.facing, OrientationWithDiagonals::Down);
            }

            // If we get here, we can't move toward the player. Bump or turn while prioritizing
            // the x-axis.
            if player_pos.x < center_pos.x {
                self.bump_or_turn(state, enemy.facing, OrientationWithDiagonals::Left)
            } else {
                self.bump_or_turn(state, enemy.facing, OrientationWithDiagonals::Right)
            }
        }
    }
}

impl Actor for BigEnemyActor {
    fn as_any(&self) -> &dyn Any {
        self
    }

    fn apply(&mut self, state: State) -> State {
        let mut state = state.clone();

        // Default to Idle state.
        state.big_enemies[self.index].anim_state = BigEnemyAnimState::Idle;

        // Update own state based on desired action.
        let action = self.get_next_action(&state);

        match action {
            BigEvilRoverAction::Move(direction) => {
                if state.big_enemies[self.index].facing.is_diagonal() {
                    panic!("Cannot move diagonally!");
                }
                let desired_pos = match direction {
                    MoveDirection::Forward => self.forward_pos(&state),
                    MoveDirection::Backward => self.backward_pos(&state),
                };
                state.big_enemies[self.index].pos = desired_pos.unwrap();
                state.big_enemies[self.index].anim_state = BigEnemyAnimState::Moving;
            }
            BigEvilRoverAction::Turn(direction) => match direction {
                TurnDirection::Left => {
                    state.big_enemies[self.index].anim_state = BigEnemyAnimState::Turning;
                    state.big_enemies[self.index].facing = state.big_enemies[self.index]
                        .facing
                        .rotate_counter_clockwise();
                }
                TurnDirection::Right => {
                    state.big_enemies[self.index].anim_state = BigEnemyAnimState::Turning;
                    state.big_enemies[self.index].facing =
                        state.big_enemies[self.index].facing.rotate_clockwise();
                }
            },
            BigEvilRoverAction::Bump(obstacle_pos) => {
                state.big_enemies[self.index].anim_state =
                    BigEnemyAnimState::Bumping(BumpAnimData {
                        pos: state.big_enemies[self.index].pos.clone(),
                        obstacle_pos,
                    });
            }
        }

        state
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{
        constants::{HEIGHT, WIDTH},
        simulation::{BigEnemy, Orientation, Player},
        state_maker::StateMaker,
    };

    #[test]
    fn get_next_action() {
        let mut base_state = StateMaker::new()
            .with_player(Player::new(3, 3, 0, Orientation::Up))
            .with_big_enemies(vec![BigEnemy::new(3, 4, OrientationWithDiagonals::Up)])
            .build();
        let actor = BigEnemyActor::new(
            0,
            Bounds {
                min_x: 0,
                max_x: WIDTH as i32,
                min_y: 0,
                max_y: HEIGHT as i32,
            },
        );

        struct TestCase {
            description: &'static str,
            enemy_pos: Pos,
            enemy_facing: OrientationWithDiagonals,
            expected_action: BigEvilRoverAction,
        }
        let test_cases = vec![
            TestCase {
                description: "One space below player, facing up",
                enemy_pos: Pos::new(2, 4),
                enemy_facing: OrientationWithDiagonals::Up,
                expected_action: BigEvilRoverAction::Move(MoveDirection::Forward),
            },
            TestCase {
                description: "One space below player, facing right",
                enemy_pos: Pos::new(2, 4),
                enemy_facing: OrientationWithDiagonals::Right,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space below player, facing left",
                enemy_pos: Pos::new(2, 4),
                enemy_facing: OrientationWithDiagonals::Left,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space below player, facing down",
                enemy_pos: Pos::new(2, 4),
                enemy_facing: OrientationWithDiagonals::Down,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space below player, facing up-left",
                enemy_pos: Pos::new(2, 4),
                enemy_facing: OrientationWithDiagonals::UpLeft,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space below player, facing up-right",
                enemy_pos: Pos::new(2, 4),
                enemy_facing: OrientationWithDiagonals::UpRight,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space below player, facing down-left",
                enemy_pos: Pos::new(2, 4),
                enemy_facing: OrientationWithDiagonals::DownLeft,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space below player, facing down-right",
                enemy_pos: Pos::new(2, 4),
                enemy_facing: OrientationWithDiagonals::DownRight,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space above player, facing up",
                enemy_pos: Pos::new(2, 0),
                enemy_facing: OrientationWithDiagonals::Up,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space above player, facing right",
                enemy_pos: Pos::new(2, 0),
                enemy_facing: OrientationWithDiagonals::Right,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space above player, facing left",
                enemy_pos: Pos::new(2, 0),
                enemy_facing: OrientationWithDiagonals::Left,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space above player, facing down",
                enemy_pos: Pos::new(2, 0),
                enemy_facing: OrientationWithDiagonals::Down,
                expected_action: BigEvilRoverAction::Move(MoveDirection::Forward),
            },
            TestCase {
                description: "One space above player, facing up-left",
                enemy_pos: Pos::new(2, 0),
                enemy_facing: OrientationWithDiagonals::UpLeft,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space above player, facing up-right",
                enemy_pos: Pos::new(2, 0),
                enemy_facing: OrientationWithDiagonals::UpRight,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space above player, facing down-left",
                enemy_pos: Pos::new(2, 0),
                enemy_facing: OrientationWithDiagonals::DownLeft,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space above player, facing down-right",
                enemy_pos: Pos::new(2, 0),
                enemy_facing: OrientationWithDiagonals::DownRight,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space to the right of player, facing up",
                enemy_pos: Pos::new(6, 2),
                enemy_facing: OrientationWithDiagonals::Up,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space to the right of player, facing right",
                enemy_pos: Pos::new(6, 2),
                enemy_facing: OrientationWithDiagonals::Right,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space to the right of player, facing left",
                enemy_pos: Pos::new(6, 2),
                enemy_facing: OrientationWithDiagonals::Left,
                expected_action: BigEvilRoverAction::Move(MoveDirection::Forward),
            },
            TestCase {
                description: "One space to the right of player, facing down",
                enemy_pos: Pos::new(6, 2),
                enemy_facing: OrientationWithDiagonals::Down,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space to the right of player, facing up-left",
                enemy_pos: Pos::new(6, 2),
                enemy_facing: OrientationWithDiagonals::UpLeft,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space to the right of player, facing up-right",
                enemy_pos: Pos::new(6, 2),
                enemy_facing: OrientationWithDiagonals::UpRight,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space to the right of player, facing down-left",
                enemy_pos: Pos::new(6, 2),
                enemy_facing: OrientationWithDiagonals::DownLeft,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space to the right of player, facing down-right",
                enemy_pos: Pos::new(6, 2),
                enemy_facing: OrientationWithDiagonals::DownRight,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space to the left of player, facing up",
                enemy_pos: Pos::new(0, 2),
                enemy_facing: OrientationWithDiagonals::Up,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space to the left of player, facing right",
                enemy_pos: Pos::new(0, 2),
                enemy_facing: OrientationWithDiagonals::Right,
                expected_action: BigEvilRoverAction::Move(MoveDirection::Forward),
            },
            TestCase {
                description: "One space to the left of player, facing left",
                enemy_pos: Pos::new(0, 2),
                enemy_facing: OrientationWithDiagonals::Left,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space to the left of player, facing down",
                enemy_pos: Pos::new(0, 2),
                enemy_facing: OrientationWithDiagonals::Down,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space to the left of player, facing up-left",
                enemy_pos: Pos::new(0, 2),
                enemy_facing: OrientationWithDiagonals::UpLeft,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space to the left of player, facing up-right",
                enemy_pos: Pos::new(0, 2),
                enemy_facing: OrientationWithDiagonals::UpRight,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Right),
            },
            TestCase {
                description: "One space to the left of player, facing down-left",
                enemy_pos: Pos::new(0, 2),
                enemy_facing: OrientationWithDiagonals::DownLeft,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
            TestCase {
                description: "One space to the left of player, facing down-right",
                enemy_pos: Pos::new(0, 2),
                enemy_facing: OrientationWithDiagonals::DownRight,
                expected_action: BigEvilRoverAction::Turn(TurnDirection::Left),
            },
        ];
        for (i, tc) in test_cases.iter().enumerate() {
            base_state.big_enemies[0].pos = tc.enemy_pos.clone();
            base_state.big_enemies[0].facing = tc.enemy_facing;
            let action = actor.get_next_action(&base_state);
            assert_eq!(
                action, tc.expected_action,
                "\n{}\n(Test case {})",
                tc.description, i
            );
        }
    }
}
