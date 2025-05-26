use crate::simulation::{
    Actor, BumpAnimData, EnemyAnimState, Obstacle, ObstacleKind, Orientation, Pos, State,
    TeleAnimData,
};

use super::{can_move_to, get_telepad_at, Bounds, MoveDirection, TurnDirection};

/// An actor for "malfunctioning" or "evil" rover enemies which always tries to chase
/// the player down. It follows the same basic movement rules as the player but doesn't
/// have any energy restrictions.
pub struct AsteroidActor {}

impl AsteroidActor {
    pub fn new() -> AsteroidActor {
        AsteroidActor {}
    }
}

impl Actor for AsteroidActor {
    fn apply(&mut self, state: State) -> State {
        let mut state = state.clone();

        // Decrement steps_until_impact of all the asteroid warnings.
        for asteroid_warning in state.asteroid_warnings.iter_mut() {
            asteroid_warning.steps_until_impact -= 1;
        }

        // Check all the asteroid warnings. If any steps_until_impact reaches 0, it
        // means an asteroid should hit the ground now. In that case, all we need to do is
        // replace the asteroid warning with an asteroid.
        let mut asteroid_warnings_to_remove = Vec::new();
        for (i, asteroid_warning) in state.asteroid_warnings.iter().enumerate() {
            if asteroid_warning.steps_until_impact == 0 {
                // Remove the asteroid warning from the state.
                asteroid_warnings_to_remove.push(i);
                // If this is a warning that will hit, add an asteroid to the state.
                if asteroid_warning.will_hit {
                    state.obstacles.push(Obstacle::new_with_kind(
                        asteroid_warning.pos.x as u32,
                        asteroid_warning.pos.y as u32,
                        ObstacleKind::Asteroid,
                    ));
                }
            }
        }
        for i in asteroid_warnings_to_remove.iter().rev() {
            state.asteroid_warnings.remove(*i);
        }

        state
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{simulation::AsteroidWarning, state_maker::StateMaker};

    #[test]
    fn test_asteroid_actor() {
        let mut actor = AsteroidActor::new();
        let mut state = StateMaker::new()
            .with_asteroid_warnings(vec![
                AsteroidWarning::new(0, 0, 1, true),
                AsteroidWarning::new(0, 1, 2, true),
                AsteroidWarning::new(0, 2, 3, false),
                AsteroidWarning::new(0, 3, 10, true),
            ])
            .build();

        // On the first step, steps_until_impact for each asteroid warning should be decremented.
        // The first one should hit and be replaced with an asteroid.
        let expected_state = StateMaker::new()
            .with_asteroid_warnings(vec![
                AsteroidWarning::new(0, 1, 1, true),
                AsteroidWarning::new(0, 2, 2, false),
                AsteroidWarning::new(0, 3, 9, true),
            ])
            .with_obstacles(vec![Obstacle::new_with_kind(0, 0, ObstacleKind::Asteroid)])
            .build();
        let new_state = actor.apply(state.clone());
        assert_eq!(new_state, expected_state);
        state = new_state;

        // On the second step, steps_until_impact should be decremented again.
        // The second one should hit and be replaced with an asteroid.
        let expected_state = StateMaker::new()
            .with_asteroid_warnings(vec![
                AsteroidWarning::new(0, 2, 1, false),
                AsteroidWarning::new(0, 3, 8, true),
            ])
            .with_obstacles(vec![
                Obstacle::new_with_kind(0, 0, ObstacleKind::Asteroid),
                Obstacle::new_with_kind(0, 1, ObstacleKind::Asteroid),
            ])
            .build();
        let new_state = actor.apply(state.clone());
        assert_eq!(new_state, expected_state);
        state = new_state;

        // On the third step, steps_until_impact should be decremented again.
        // The third one *should not* hit because will_hit is false. Instead
        // it should disappear from the state.
        let expected_state = StateMaker::new()
            .with_asteroid_warnings(vec![AsteroidWarning::new(0, 3, 7, true)])
            .with_obstacles(vec![
                Obstacle::new_with_kind(0, 0, ObstacleKind::Asteroid),
                Obstacle::new_with_kind(0, 1, ObstacleKind::Asteroid),
            ])
            .build();
        let new_state = actor.apply(state.clone());
        assert_eq!(new_state, expected_state);
        state = new_state;

        // Skip ahead to 10 steps later.
        for _ in 0..10 {
            state = actor.apply(state.clone());
        }

        // The last one should hit and be replaced with an asteroid.
        let expected_state = StateMaker::new()
            .with_obstacles(vec![
                Obstacle::new_with_kind(0, 0, ObstacleKind::Asteroid),
                Obstacle::new_with_kind(0, 1, ObstacleKind::Asteroid),
                Obstacle::new_with_kind(0, 3, ObstacleKind::Asteroid),
            ])
            .build();
        let new_state = actor.apply(state.clone());
        assert_eq!(new_state, expected_state);
    }
}
