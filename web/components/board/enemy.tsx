import { useCallback } from "react";
import { Offset } from "../../lib/utils";
import { TILE_SIZE, BUG_Z_INDEX, CSS_ANIM_DURATION } from "../../lib/constants";
import groverUpUrl from "../../images/grover_up.png";
import groverDownUrl from "../../images/grover_down.png";
import groverLeftUrl from "../../images/grover_left.png";
import groverRightUrl from "../../images/grover_right.png";
import { TeleAnimData } from "../../../elara-lib/pkg/elara_lib";

interface EnemyProps {
  offset: Offset;
  // eslint-disable-next-line react/no-unused-prop-types
  fuzzy: boolean;
  animState: string;
  // eslint-disable-next-line react/no-unused-prop-types
  animData?: TeleAnimData;
  enableAnimations: boolean;
  facing: string;
}

export default function Enemy(props: EnemyProps) {
  const getAnimationStyles = useCallback(() => {
    if (!props.enableAnimations || props.animState === "idle") {
      return { transition: "none" };
    }
    if (props.animState === "teleporting") {
      // TODO(albrow): Handle teleportation.
      // return {
      //   animation: `${CSS_ANIM_DURATION}s ease-in-out teleport`,
      // };
    }
    return {
      transition: `left ${CSS_ANIM_DURATION}s 0.1s, top ${CSS_ANIM_DURATION}s 0.1s`,
    };
  }, [props.animState, props.enableAnimations]);

  const getRobotImgUrl = useCallback(() => {
    switch (props.facing) {
      case "up":
        return groverUpUrl;
      case "down":
        return groverDownUrl;
      case "left":
        return groverLeftUrl;
      case "right":
        return groverRightUrl;
      default:
        throw new Error(`Unknown orientation: + ${props.facing}`);
    }
  }, [props.facing]);

  return (
    <img
      alt="bug"
      className="bug sprite"
      src={getRobotImgUrl()}
      style={{
        ...getAnimationStyles(),
        width: `${TILE_SIZE - 1}px`,
        height: `${TILE_SIZE - 1}px`,
        zIndex: BUG_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
        filter:
          "drop-shadow(-2px 2px 2px rgba(0, 0, 0, 0.3)) hue-rotate(180deg) brightness(85%) contrast(150%) saturate(200%)",
      }}
    />
  );
}
