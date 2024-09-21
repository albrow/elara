import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import { ENEMY_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import evelRoverUpImg from "../../images/board/evil_rover_up.png";
import evilRoverDownImg from "../../images/board/evil_rover_down.png";
import evilRoverLeftImg from "../../images/board/evil_rover_left.png";
import evilRoverRightImg from "../../images/board/evil_rover_right.png";
import lightningEffectUrl from "../../images/board/lightning.gif";
import { TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import {
  Offset,
  getTileSize,
  getDefaultSpriteDims,
} from "../../lib/board_utils";
import { getSpriteAnimations } from "./anim_utils";
import BoardHoverInfo from "./board_hover_info";
import MalfunctioningRoverPage from "./hover_info_pages/malfunctioning_rover.mdx";

interface EnemyProps {
  offset: Offset;
  animState: string;
  animData?: TeleAnimData;
  enableAnimations: boolean;
  facing: string;
  enableHoverInfo: boolean;
  scale: number;
  filter?: string;
}

export default function Enemy(props: EnemyProps) {
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );

  const animation = useMemo(
    () =>
      getSpriteAnimations(
        props.scale,
        props.enableAnimations,
        props.animState,
        props.animData,
        0.2
      ),
    [props.animData, props.animState, props.enableAnimations, props.scale]
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
        <BoardHoverInfo
          page={MalfunctioningRoverPage}
          offset={props.offset}
          scale={props.scale}
        />
      )}
      {animation.definitions}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${tileSize}px`}
        h={`${tileSize}px`}
        zIndex={ENEMY_Z_INDEX}
        style={animation.style}
        filter={props.filter}
      >
        <div
          style={{
            width: `${tileSize}px`,
            height: `${tileSize}px`,
            zIndex: ENEMY_Z_INDEX,
          }}
        >
          <img
            alt=""
            src={getRobotImgUrl()}
            style={{
              width: `${spriteDims.width}px`,
              height: `${spriteDims.height}px`,
              marginTop: `${spriteDims.marginTop}px`,
              marginLeft: `${spriteDims.marginLeft}px`,
              position: "absolute",
              filter: SPRITE_DROP_SHADOW,
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
              alt=""
              style={{
                position: "relative",
                top: `${tileSize * 0.2 * props.scale}px`,
                left: `${tileSize * 0.2 * props.scale}px`,
                width: `${tileSize * 0.6 * props.scale}px`,
                height: `${tileSize * 0.6 * props.scale}px`,
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
