import { useCallback, useMemo } from "react";
import { Box } from "@chakra-ui/react";
import { Offset } from "../../lib/utils";
import { ENEMY_Z_INDEX, TILE_SIZE } from "../../lib/constants";
import groverUpUrl from "../../images/grover_up.png";
import groverDownUrl from "../../images/grover_down.png";
import groverLeftUrl from "../../images/grover_left.png";
import groverRightUrl from "../../images/grover_right.png";
import lightningEffectUrl from "../../images/lightning.gif";
import { TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import { getSpriteAnimations } from "./anim_utils";

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
  const animation = useMemo(
    () =>
      getSpriteAnimations(
        props.enableAnimations,
        props.animState,
        props.animData,
        0.1
      ),
    [props.animData, props.animState, props.enableAnimations]
  );

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
    <>
      {animation.definitions}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={ENEMY_Z_INDEX}
        style={animation.style}
      >
        <div
          className="enemy sprite"
          style={{
            width: `${TILE_SIZE - 2}px`,
            height: `${TILE_SIZE - 2}px`,
            marginTop: "1px",
            zIndex: ENEMY_Z_INDEX,
          }}
        >
          <img
            alt="enemy"
            className="enemy sprite"
            src={getRobotImgUrl()}
            style={{
              filter:
                "drop-shadow(-2px 2px 2px rgba(0, 0, 0, 0.3)) hue-rotate(180deg) brightness(85%) contrast(150%) saturate(200%)",
            }}
          />
          <img
            src={lightningEffectUrl}
            alt="lightning effect"
            style={{
              position: "relative",
              top: `${TILE_SIZE * 0.15}px`,
              left: `${TILE_SIZE * 0.15}px`,
              width: `${TILE_SIZE * 0.7}px`,
              height: `${TILE_SIZE * 0.7}px`,
              zIndex: ENEMY_Z_INDEX + 1,
              filter:
                "drop-shadow(0px 0px 4px rgba(255, 0, 0, 0.6))  saturate(200%) brightness(150%)",
            }}
          />
        </div>
      </Box>
    </>
  );
}
