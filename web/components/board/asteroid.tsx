import { Box, Image } from "@chakra-ui/react";
import { Animate } from "react-simple-animate";
import { useCallback, useEffect, useMemo } from "react";

import {
  ASTEROID_Z_INDEX,
  ROCK_Z_INDEX,
  SPRITE_DROP_SHADOW,
} from "../../lib/constants";
import rockImgUrl from "../../images/board/rock.png";
import impactImgUrl from "../../images/board/impact.png";
import {
  Offset,
  getDefaultSpriteDims,
  getTileSize,
} from "../../lib/board_utils";
import { useSoundManager } from "../../hooks/sound_manager_hooks";

interface AsteroidProps {
  offset: Offset;
  animState: string;
  enableAnimations: boolean;
  scale: number;
  filter?: string;
}

export default function Asteroid(props: AsteroidProps) {
  const xOffset = Math.random() * 200 - 100;
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );

  const { getSound } = useSoundManager();
  const fallingSound = useMemo(() => getSound("asteroid_falling"), [getSound]);
  const impactSound = useMemo(() => getSound("asteroid_impact"), [getSound]);

  const stopMySoundEffects = useCallback(() => {
    fallingSound.stop();
    impactSound.stop();
  }, [fallingSound, impactSound]);

  // Stop all sound effects when the asteroid unmounts.
  //
  // Note(albrow): This currently causes issues with React Strict Mode.
  // Strict Mode causes the asteroid to unmount and remount multiple times, which
  // can cause sound effects to not trigger. (Basically one asteroid can mount right before
  // another one unmounts, which can cause the sound effects for the first asteroid to not
  // trigger.) In production, this shouldn't be an issue in practice.
  useEffect(() => () => {
    stopMySoundEffects();
  }, [stopMySoundEffects]);

  // Play sound effects when the asteroid is falling or recently hit the ground.
  useEffect(() => {
    if (props.enableAnimations) {
      if (props.animState === "falling") {
        fallingSound.stop();
        // console.log("playing falling sound");
        fallingSound.play();
      } else if (props.animState === "recently_hit_ground") {
        impactSound.stop();
        // console.log("playing impact sound");
        impactSound.play();
      }
    }
  }, [props.animState, props.enableAnimations, fallingSound, impactSound]);

  if (props.animState === "falling") {
    // If animations are enabled, show the falling animation.
    if (props.enableAnimations) {
      return (
        <Box
          left={props.offset.left}
          top={props.offset.top}
          position="absolute"
          w={`${tileSize}px`}
          h={`${tileSize}px`}
          zIndex={ASTEROID_Z_INDEX}
          filter={props.filter}
        >
          <Animate
            play
            delay={0.35}
            duration={0.6}
            start={{ transform: `translate(${xOffset}px, -500px) scale(1.5)` }}
            end={{ transform: "translate(0, 0) scale(1.0)" }}
          >
            <Image
              position="absolute"
              // TODO(albrow): Use unique art for asteroids. For now, just re-using the rock art.
              src={rockImgUrl}
              h={`${spriteDims.height}px`}
              w={`${spriteDims.width}px`}
              mt={`${spriteDims.marginTop}px`}
              ml={`${spriteDims.marginLeft}px`}
              zIndex={ASTEROID_Z_INDEX}
              filter={SPRITE_DROP_SHADOW}
            />
          </Animate>
        </Box>
      );
    }
    // If animations are disabled but we're in the "falling" state,
    // we just show an empty space. This just means the asteroid hasn't
    // quite hit the ground yet.
    return (
      <Box />
    );
  }

  // If we reached here, it means the asteroid has either just hit the ground
  // (i.e. the "recently_hit_ground" state) or has hit the ground more than one
  // step ago (i.e. the "stationary" state). In either case, we show the actual
  // asteroid.
  return (
    <>
      <Box
        left={props.offset.left}
        top={props.offset.top}
        position="absolute"
        w={`${tileSize}px`}
        h={`${tileSize}px`}
        zIndex={ROCK_Z_INDEX}
        filter={props.filter}
      >
        <Image
          position="absolute"
          src={rockImgUrl}
          h={`${spriteDims.height}px`}
          w={`${spriteDims.width}px`}
          mt={`${spriteDims.marginTop}px`}
          ml={`${spriteDims.marginLeft}px`}
          zIndex={ROCK_Z_INDEX}
          filter={SPRITE_DROP_SHADOW}
        />
      </Box>
      <Box>
        {
          // If animations are enabled and we're in the "recently_hit_ground" state,
          // show the impact animation.
          props.enableAnimations && props.animState === "recently_hit_ground" && (
            <Animate
              play
              duration={1.0}
              start={{ opacity: 1.0 }}
              end={{ opacity: 0 }}
            >
              <Image
                left={`${props.offset.leftNum - 8 * props.scale}px`}
                top={`${props.offset.topNum - 8 * props.scale}px`}
                position="absolute"
                w={`${66 * props.scale}px`}
                h={`${66 * props.scale}px`}
                src={impactImgUrl}
                filter={SPRITE_DROP_SHADOW}
                zIndex={ROCK_Z_INDEX - 1}
              />
            </Animate>
          )
        }
      </Box>
    </>
  );


}
