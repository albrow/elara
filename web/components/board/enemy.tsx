import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const [effectRotation, setEffectRotation] = useState(0);
  const lightningImg = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const ticker = setInterval(() => {
      setEffectRotation((prev) => (prev + 90) % 360);
      if (lightningImg.current) {
        lightningImg.current.style.transform = `rotate(${effectRotation}deg)`;
      }
    }, 1500);
    return () => clearInterval(ticker);
  });

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
            // We use the same image as for G.R.O.V.E.R. but with a filter
            // that makes the malfunctioning rover look darker and more red in hue.
            // TODO(albrow): Replace this with a separate sprite.
            style={{
              filter:
                "drop-shadow(-2px 2px 2px rgba(0, 0, 0, 0.3)) hue-rotate(180deg) " +
                "brightness(80%) sepia(20%) contrast(120%) saturate(200%)",
            }}
          />
          <Box
            // If the rover is facing to the side, the perspective means that the body
            // of the rover is shorter in the y dimension. To compensate, we scale the
            // lightning effect down so it matches more closely with the rover body.
            style={{
              transform:
                props.facing === "left" || props.facing === "right"
                  ? "scaleY(0.7)"
                  : "none",
            }}
          >
            <img
              ref={lightningImg}
              src={lightningEffectUrl}
              alt="lightning effect"
              style={{
                position: "relative",
                top: `${TILE_SIZE * 0.2}px`,
                left: `${TILE_SIZE * 0.2}px`,
                width: `${TILE_SIZE * 0.6}px`,
                height: `${TILE_SIZE * 0.6}px`,
                zIndex: ENEMY_Z_INDEX + 1,
                filter:
                  "drop-shadow(0px 0px 4px rgba(255, 0, 0, 0.9)) saturate(200%) brightness(150%)",
              }}
            />
          </Box>
        </div>
      </Box>
    </>
  );
}
