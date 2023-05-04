import { TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import { CSS_ANIM_DURATION } from "../../lib/constants";
import { posToOffset } from "../../lib/utils";

export interface CSSAnimation {
  // A style object to be applied to the sprite (e.g. in the style prop).
  style: React.CSSProperties;
  // A React node containing CSS keyframe definitions inside a style tag (if any).
  definitions?: React.ReactNode;
}

// A helper function for generating CSS keyframe animations for various animation
// states (e.g. for the teloprtation animation). It returns a style tag containing
// the keyframe definitions based on the given animation state and animation data.
function getSpriteAnimationDefinitions(
  animState: string,
  animData: TeleAnimData | undefined,
  animId: string
) {
  if (animState === "teleporting") {
    const startOffset = posToOffset(animData!.start_pos);
    const enterOffset = posToOffset(animData!.enter_pos);
    const exitOffset = posToOffset(animData!.exit_pos);
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
  return null;
}

// A helper function for generating CSS styles and keyframe definitions for
// different kinds of animations.
export function getSpriteAnimations(
  enableAnimations: boolean,
  animState: string,
  animData: TeleAnimData | undefined,
  delaySeconds?: number
): CSSAnimation {
  if (!enableAnimations || animState === "idle") {
    return { style: { transition: "none" } };
  }
  if (animState === "teleporting") {
    // Use a unique animation ID to avoid conflicts with other teleport animations.
    const animId = `teleport-${animData!.start_pos.x}-${
      animData!.start_pos.y
    }-${animData!.enter_pos.x}-${animData!.enter_pos.y}-${
      animData!.exit_pos.x
    }-${animData!.exit_pos.y}`;
    return {
      style: { animation: `${CSS_ANIM_DURATION}s ease-in-out ${animId}` },
      definitions: getSpriteAnimationDefinitions(animState, animData, animId),
    };
  }
  return {
    style: {
      transition:
        `left ${CSS_ANIM_DURATION}s ${delaySeconds || 0}s, ` +
        `top ${CSS_ANIM_DURATION}s ${delaySeconds || 0}s`,
    },
  };
}
