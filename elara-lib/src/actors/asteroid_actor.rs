use std::any::Any;

use crate::simulation::{Actor, Asteroid, AsteroidAnimState, State};

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
    fn as_any(&self) -> &dyn Any {
        self
    }

    fn apply(&mut self, state: State) -> State {
        let mut state = state.clone();

        // Decrement steps_until_impact of all the asteroid warnings.
        for asteroid_warning in state.asteroid_warnings.iter_mut() {
            asteroid_warning.steps_until_impact -= 1;
        }

        // Check all the existing asteroids and update their anim state.
        for asteroid in state.asteroids.iter_mut() {
            if asteroid.anim_state == AsteroidAnimState::RecentlyHitGround {
                // If the asteroid just hit the ground in the previous step, it should now be stationary.
                asteroid.anim_state = AsteroidAnimState::Stationary;
            }
            if asteroid.anim_state == AsteroidAnimState::Falling {
                // If the asteroid was falling in the previous step, it should now hit the ground.
                asteroid.anim_state = AsteroidAnimState::RecentlyHitGround;
            }
        }

        // Next, check all the asteroid warnings.
        let mut asteroid_warnings_to_remove = Vec::new();
        for (i, asteroid_warning) in state.asteroid_warnings.iter_mut().enumerate() {
            // If any steps_until_impact is 1 and will_hit is true, it means
            // the asteroid is about to hit the ground. In that case, we need to
            // add an asteroid with the "Falling" anim state.
            if asteroid_warning.steps_until_impact == 1 && asteroid_warning.will_hit {
                state.asteroids.push(Asteroid::new(
                    asteroid_warning.pos.x as u32,
                    asteroid_warning.pos.y as u32,
                    AsteroidAnimState::Falling,
                ));
            }
            // If any steps_until_impact is 0, we should remove it.
            if asteroid_warning.steps_until_impact == 0 {
                asteroid_warnings_to_remove.push(i);
            }
        }

        // Remove any asteroid warnings that were marked for removal.
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
                AsteroidWarning::new(0, 0, 2, true),
                AsteroidWarning::new(0, 1, 3, true),
                AsteroidWarning::new(0, 2, 4, false),
                AsteroidWarning::new(0, 3, 10, true),
            ])
            .build();

        // On the first step, steps_until_impact for each asteroid warning should be decremented.
        // One asteroid should be added in the "falling" state.
        let expected_state = StateMaker::new()
            .with_asteroid_warnings(vec![
                AsteroidWarning::new(0, 0, 1, true),
                AsteroidWarning::new(0, 1, 2, true),
                AsteroidWarning::new(0, 2, 3, false),
                AsteroidWarning::new(0, 3, 9, true),
            ])
            .with_asteroids(vec![Asteroid::new(0, 0, AsteroidAnimState::Falling)])
            .build();
        let new_state = actor.apply(state.clone());
        assert_eq!(new_state, expected_state);
        state = new_state;

        // On the second step, steps_until_impact should be decremented again.
        // The first asteroid should have just hit the ground and the corresponding asteroid warning removed.
        // The second asteroid should be added in the "falling" state.
        let expected_state = StateMaker::new()
            .with_asteroid_warnings(vec![
                AsteroidWarning::new(0, 1, 1, true),
                AsteroidWarning::new(0, 2, 2, false),
                AsteroidWarning::new(0, 3, 8, true),
            ])
            .with_asteroids(vec![
                Asteroid::new(0, 0, AsteroidAnimState::RecentlyHitGround),
                Asteroid::new(0, 1, AsteroidAnimState::Falling),
            ])
            .build();
        let new_state = actor.apply(state.clone());
        assert_eq!(new_state, expected_state);
        state = new_state;

        // On the third step, steps_until_impact should be decremented again.
        // This time a third asteroid *should not* be added because will_hit is false.
        let expected_state = StateMaker::new()
            .with_asteroid_warnings(vec![
                AsteroidWarning::new(0, 2, 1, false),
                AsteroidWarning::new(0, 3, 7, true),
            ])
            .with_asteroids(vec![
                Asteroid::new(0, 0, AsteroidAnimState::Stationary),
                Asteroid::new(0, 1, AsteroidAnimState::RecentlyHitGround),
            ])
            .build();
        let new_state = actor.apply(state.clone());
        assert_eq!(new_state, expected_state);
        state = new_state;

        // On the fourth step, the third asteroid warning should be removed.
        let expected_state = StateMaker::new()
            .with_asteroid_warnings(vec![AsteroidWarning::new(0, 3, 6, true)])
            .with_asteroids(vec![
                Asteroid::new(0, 0, AsteroidAnimState::Stationary),
                Asteroid::new(0, 1, AsteroidAnimState::Stationary),
            ])
            .build();
        let new_state = actor.apply(state.clone());
        assert_eq!(new_state, expected_state);
        state = new_state;

        // Skip ahead to 10 steps later.
        for _ in 0..10 {
            state = actor.apply(state.clone());
        }

        // The last asteroid warning should hit and be replaced with an asteroid.
        // There are no remaining asteroid warnings and all asteroids should be
        // stationary at this point.
        let expected_state = StateMaker::new()
            .with_asteroids(vec![
                Asteroid::new(0, 0, AsteroidAnimState::Stationary),
                Asteroid::new(0, 1, AsteroidAnimState::Stationary),
                Asteroid::new(0, 3, AsteroidAnimState::Stationary),
            ])
            .build();
        let new_state = actor.apply(state.clone());
        assert_eq!(new_state, expected_state);
    }
}
