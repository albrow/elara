import { v4 as uuidv4 } from "uuid";

import { BumpAnimData, TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import { CSS_ANIM_DURATION } from "../../lib/constants";
import { Offset, posToOffset } from "../../lib/board_utils";

export interface CSSAnimation {
  // A style object to be applied to the sprite (e.g. in the style prop).
  style: React.CSSProperties;
  // A React node containing CSS keyframe definitions inside a style tag (if any).
  definitions?: React.ReactNode;
}

function computeInBetween(
  startOffset: Offset,
  endOffset: Offset,
  percent: number
): Offset {
  const leftNum =
    startOffset.leftNum + (endOffset.leftNum - startOffset.leftNum) * percent;
  const topNum =
    startOffset.topNum + (endOffset.topNum - startOffset.topNum) * percent;
  return {
    left: `${leftNum}px`,
    top: `${topNum}px`,
    leftNum,
    topNum,
  };
}

// A helper function for generating CSS keyframe animations for various animation
// states (e.g. for the teloprtation animation). It returns a style tag containing
// the keyframe definitions based on the given animation state and animation data.
function getSpriteAnimationDefinitions(
  scale: number,
  animState: string,
  animData: TeleAnimData | BumpAnimData | undefined,
  animId: string,
  spriteSize: number
) {
  if (animState === "teleporting") {
    const data = animData as TeleAnimData;
    const startOffset = posToOffset(scale, data!.start_pos);
    const enterOffset = posToOffset(scale, data!.enter_pos);
    const exitOffset = posToOffset(scale, data!.exit_pos);
    return (
      <style>
        {`@keyframes ${animId} {
          0% {
            left: ${startOffset.left};
            top: ${startOffset.top};
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(0.25) rotate(180deg);
          }
          35% {
            left: ${enterOffset.left};
            top: ${enterOffset.top};
          }
          50% {
            transform: scale(0.1) rotate(360deg);
          }
          75% {
            transform: scale(0.25) rotate(540deg);
          }
          90% {
            left: ${exitOffset.left};
            top: ${exitOffset.top};
            transform: scale(1) rotate(720deg);
          }
          100% {
            left: ${exitOffset.left};
            top: ${exitOffset.top};
            transform: scale(1) rotate(720deg);
          }
        }`}
      </style>
    );
  }
  if (animState === "bumping") {
    // For the bumping animation, we animate 10% of the way to the obstacle,
    // then back.
    const data = animData as BumpAnimData;
    const startOffset = posToOffset(scale, data!.pos);
    const obsOffset = posToOffset(scale, data!.obstacle_pos);

    // Use a bigger offset for bigger sprites.
    const offsetAmount = spriteSize === 48 ? 0.1 : 0.2;
    const endOffset = computeInBetween(startOffset, obsOffset, offsetAmount);
    return (
      <style>
        {`@keyframes ${animId} {
          0% {
            left: ${startOffset.left};
            top: ${startOffset.top};
          }
          25% {
            left: ${endOffset.left};
            top: ${endOffset.top};
          }
          50% {
            left: ${startOffset.left};
            top: ${startOffset.top};
          }
          100% {
            left: ${startOffset.left};
            top: ${startOffset.top};
          }
        }`}
      </style>
    );
  }
  return null;
}

// A helper function for generating CSS styles and keyframe definitions for
// different kinds of animations.
export function getSpriteAnimations(
  scale: number,
  enableAnimations: boolean,
  animState: string,
  animData: TeleAnimData | BumpAnimData | undefined,
  delaySeconds?: number,
  spriteSize?: number
): CSSAnimation {
  const spriteSizeVal = spriteSize || 48;
  const delaySecondsVal = delaySeconds || 0;
  if (!enableAnimations || animState === "idle") {
    return { style: { transition: "none" } };
  }
  if (animState === "teleporting") {
    // Use a unique animation ID to avoid conflicts with other teleport animations.
    const animId = `teleport-${uuidv4()}`;
    return {
      style: { animation: `${CSS_ANIM_DURATION}s ease-in-out ${animId}` },
      definitions: getSpriteAnimationDefinitions(
        scale,
        animState,
        animData,
        animId,
        spriteSizeVal
      ),
    };
  }
  if (animState === "bumping") {
    // Use a unique animation ID to avoid conflicts with other bump animations.
    const animId = `bump-${uuidv4()}`;
    return {
      style: {
        animation: `${CSS_ANIM_DURATION}s ease-in-out ${animId}`,
      },
      definitions: getSpriteAnimationDefinitions(
        scale,
        animState,
        animData,
        animId,
        spriteSizeVal
      ),
    };
  }

  return {
    style: {
      animation: "none",
      transition:
        `left ${CSS_ANIM_DURATION}s ${delaySecondsVal}s, ` +
        `top ${CSS_ANIM_DURATION}s ${delaySecondsVal}s`,
    },
  };
}
