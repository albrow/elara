import { useCallback } from "react";
import { Offset } from "../../lib/utils";
import { TILE_SIZE, BUG_Z_INDEX, CSS_ANIM_DURATION } from "../../lib/constants";
import bugImgUrl from "../../images/bug.png";
import glitchyBugImgUrl from "../../images/bug_glitchy.gif";

interface EnemyProps {
  offset: Offset;
  fuzzy: boolean;
  animState: string;
}

export default function Enemy(props: EnemyProps) {
  // TODO(albrow): Don't use CSS transitions if the player is pausing/stepping
  // through manually. Will require passing in a new prop for the pause state.
  const getCssTransition = useCallback(() => {
    if (props.animState === "idle") {
      return "none";
    }
    return `left ${CSS_ANIM_DURATION}s 0.1s, top ${CSS_ANIM_DURATION}s 0.1s`;
  }, [props.animState]);

  return (
    <img
      alt="bug"
      className="bug sprite"
      src={props.fuzzy ? glitchyBugImgUrl : bugImgUrl}
      style={{
        transition: getCssTransition(),
        width: `${TILE_SIZE - 1}px`,
        height: `${TILE_SIZE - 1}px`,
        zIndex: BUG_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    />
  );
}
