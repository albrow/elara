import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Img } from "@chakra-ui/react";

import { ENEMY_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import { TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import { getTileSize, Offset, SpriteDimensions } from "../../lib/board_utils";
import gretaUpUrl from "../../images/board/greta_up.png";
import gretaDownUrl from "../../images/board/greta_down.png";
import gretaLeftUrl from "../../images/board/greta_left.png";
import gretaRightUrl from "../../images/board/greta_right.png";
import gretaUpLeftUrl from "../../images/board/greta_up_left.png";
import gretaUpRightUrl from "../../images/board/greta_up_right.png";
import gretaDownLeftUrl from "../../images/board/greta_down_left.png";
import gretaDownRightUrl from "../../images/board/greta_down_right.png";
import lightningEffectUrl from "../../images/board/lightning.gif";
import { useImagePreloader } from "../../hooks/image_preloader";
import GretaHoverPage from "./hover_info_pages/greta_malfunctioning.mdx";
import BoardHoverInfo from "./board_hover_info";
import { getSpriteAnimations } from "./anim_utils";

interface BigEnemyProps {
  offset: Offset;
  animState: string;
  animData?: TeleAnimData;
  enableAnimations: boolean;
  facing: string;
  enableHoverInfo: boolean;
  scale: number;
  filter?: string;
}

export default function BigEnemy(props: BigEnemyProps) {
  // Pre-load images to prevent flickering when rotating between
  // diagonal directions.
  useImagePreloader([
    gretaUpUrl,
    gretaDownUrl,
    gretaLeftUrl,
    gretaRightUrl,
    gretaUpLeftUrl,
    gretaUpRightUrl,
    gretaDownLeftUrl,
    gretaDownRightUrl,
  ]);

  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);

  const animation = useMemo(
    () =>
      getSpriteAnimations(
        props.scale,
        props.enableAnimations,
        props.animState,
        props.animData,
        0.2,
        144
      ),
    [props.animData, props.animState, props.enableAnimations, props.scale]
  );

  const spriteDims: SpriteDimensions = useMemo(
    () => ({
      marginTop: 1 * props.scale,
      marginLeft: 1 * props.scale,
      width: 144 * props.scale,
      height: 144 * props.scale,
    }),
    [props.scale]
  );

  const imgUrl = useMemo(() => {
    switch (props.facing) {
      case "up":
        return gretaUpUrl;
      case "up_right":
        return gretaUpRightUrl;
      case "up_left":
        return gretaUpLeftUrl;
      case "down":
        return gretaDownUrl;
      case "down_right":
        return gretaDownRightUrl;
      case "down_left":
        return gretaDownLeftUrl;
      case "left":
        return gretaLeftUrl;
      case "right":
        return gretaRightUrl;
      default:
        throw new Error(`Invalid facing: ${props.facing}`);
    }
  }, [props.facing]);

  const lightningTransform = useMemo(() => {
    // If the rover is facing to the side or diagonally, the perspective means that
    // the body of the rover is smaller and offset. To compensate, we scale the
    // lightning effect down so it matches more closely with the rover body.
    switch (props.facing) {
      case "down_left":
      case "up_left":
      case "up_right":
      case "down_right":
        return "translateY(10px) translateX(10px) scale(0.9)";
      case "left":
      case "right":
        return "translateY(10px) scaleX(0.9)";
      default:
        return "none";
    }
  }, [props.facing]);

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

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={GretaHoverPage}
          offset={props.offset}
          scale={props.scale}
          width={3}
          height={3}
        />
      )}
      {animation.definitions}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${tileSize * 3}px`}
        h={`${tileSize * 3}px`}
        zIndex={ENEMY_Z_INDEX}
        style={animation.style}
        filter={props.filter}
      >
        <Img
          position="absolute"
          src={imgUrl}
          w={`${spriteDims.width}px`}
          h={`${spriteDims.height}px`}
          mt={`${spriteDims.marginTop}px`}
          ml={`${spriteDims.marginLeft}px`}
          zIndex={ENEMY_Z_INDEX + 1}
          filter={SPRITE_DROP_SHADOW}
        />
        <Box
          position="relative"
          zIndex={ENEMY_Z_INDEX + 2}
          transform={lightningTransform}
          style={{
            top: `${tileSize * 0.2}px`,
            left: `${tileSize * 0.6}px`,
            width: `${tileSize * 1.5}px`,
            height: `${tileSize * 1.5}px`,
          }}
        >
          <img
            ref={lightningImg}
            src={lightningEffectUrl}
            alt=""
            style={{
              filter:
                "drop-shadow(0px 0px 4px rgba(255, 0, 0, 0.9)) saturate(200%) brightness(150%)",
            }}
          />
        </Box>
      </Box>
    </>
  );
}
