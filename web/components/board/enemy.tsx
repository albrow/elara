import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import { ENEMY_Z_INDEX, TILE_SIZE } from "../../lib/constants";
import evelRoverUpImg from "../../images/board/evil_rover_up.png";
import evilRoverDownImg from "../../images/board/evil_rover_down.png";
import evilRoverLeftImg from "../../images/board/evil_rover_left.png";
import evilRoverRightImg from "../../images/board/evil_rover_right.png";
import lightningEffectUrl from "../../images/board/lightning.gif";
import { Pos, TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import { posToOffset, rowBasedZIndex } from "../../lib/utils";
import { getSpriteAnimations } from "./anim_utils";
import BoardHoverInfo from "./board_hover_info";
import MalfunctioningRoverPage from "./hover_info_pages/malfunctioning_rover.mdx";

interface EnemyProps {
  pos: Pos;
  animState: string;
  animData?: TeleAnimData;
  enableAnimations: boolean;
  facing: string;
  enableHoverInfo: boolean;
}

export default function Enemy(props: EnemyProps) {
  const offset = useMemo(() => posToOffset(props.pos), [props.pos]);
  const zIndex = useMemo(
    () => rowBasedZIndex(props.pos.y, ENEMY_Z_INDEX),
    [props.pos.y]
  );

  const animation = useMemo(
    () =>
      getSpriteAnimations(
        props.enableAnimations,
        props.animState,
        props.animData,
        0.2
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
        return evelRoverUpImg;
      case "down":
        return evilRoverDownImg;
      case "left":
        return evilRoverLeftImg;
      case "right":
        return evilRoverRightImg;
      default:
        throw new Error(`Unknown orientation: + ${props.facing}`);
    }
  }, [props.facing]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo page={MalfunctioningRoverPage} offset={offset} />
      )}
      {animation.definitions}
      <Box
        position="absolute"
        left={offset.left}
        top={offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={zIndex}
        style={animation.style}
      >
        <div
          style={{
            width: `${TILE_SIZE - 2}px`,
            height: `${TILE_SIZE - 2}px`,
            marginTop: "1px",
            zIndex,
          }}
        >
          <img
            alt="enemy"
            src={getRobotImgUrl()}
            // We use the same image as for G.R.O.V.E.R. but with a filter
            // that makes the malfunctioning rover look darker and more red in hue.
            // TODO(albrow): Replace this with a separate sprite.
            style={{
              width: `${TILE_SIZE - 2}px`,
              height: `${TILE_SIZE - 2}px`,
              position: "absolute",
              filter: "drop-shadow(-2px 3px 2px rgba(0, 0, 0, 0.3))",
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
