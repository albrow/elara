import { Box, Image } from "@chakra-ui/react";
import { Animate, AnimateGroup } from "react-simple-animate";
import { useCallback, useEffect, useMemo, useState } from "react";
import { once } from "lodash";

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
  scale: number;
  filter?: string;
}

export default function Asteroid(props: AsteroidProps) {
  const xOffset = Math.random() * 200 - 100;
  const [hasImpacted, setHasImpacted] = useState(false);
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

  // Stop all sound effects when the component unmounts.
  useEffect(
    () => () => {
      stopMySoundEffects();
    },
    [stopMySoundEffects]
  );

  // Play the falling sound effect when the component mounts.
  useEffect(() => {
    if (!hasImpacted) {
      if (fallingSound.isPlaying()) {
        return;
      }
      stopMySoundEffects();
      fallingSound.play();
    }
  }, [fallingSound, hasImpacted, props.offset, stopMySoundEffects]);

  // Play the impact sound effect when the asteroid hits the ground.
  const playImpactSound = useCallback(() => {
    if (impactSound.isPlaying()) {
      return;
    }
    stopMySoundEffects();
    impactSound.play();
  }, [impactSound, stopMySoundEffects]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onFallAnimationComplete = useCallback(
    once(() => {
      playImpactSound();
      setHasImpacted(true);
    }),
    [playImpactSound]
  );

  return (
    <AnimateGroup play>
      <Box
        left={props.offset.left}
        top={props.offset.top}
        position="absolute"
        w={`${tileSize}px`}
        h={`${tileSize}px`}
        zIndex={hasImpacted ? ROCK_Z_INDEX : ASTEROID_Z_INDEX}
        filter={props.filter}
      >
        <Animate
          play
          sequenceId={1}
          duration={0.6}
          start={{ transform: `translate(${xOffset}px, -500px) scale(1.5)` }}
          end={{ transform: "translate(0, 0) scale(1.0)" }}
          onComplete={onFallAnimationComplete}
        >
          <Image
            position="absolute"
            // TODO(albrow): Use unique art for asteroids. For now, just re-using the rock art.
            src={rockImgUrl}
            h={`${spriteDims.height}px`}
            w={`${spriteDims.width}px`}
            mt={`${spriteDims.marginTop}px`}
            ml={`${spriteDims.marginLeft}px`}
            zIndex={hasImpacted ? ROCK_Z_INDEX : ASTEROID_Z_INDEX}
            filter={SPRITE_DROP_SHADOW}
          />
        </Animate>
      </Box>
      <Animate
        play
        sequenceId={2}
        delay={1}
        duration={1.5}
        start={{ opacity: 1.0 }}
        end={{ opacity: 0 }}
        onComplete={() => {
          stopMySoundEffects();
        }}
      >
        <Image
          left={`${props.offset.leftNum - 8 * props.scale}px`}
          top={`${props.offset.topNum - 8 * props.scale}px`}
          display={hasImpacted ? "block" : "none"}
          position="absolute"
          w={`${66 * props.scale}px`}
          h={`${66 * props.scale}px`}
          src={impactImgUrl}
          filter={SPRITE_DROP_SHADOW}
          zIndex={ROCK_Z_INDEX - 1}
        />
      </Animate>
    </AnimateGroup>
  );
}
