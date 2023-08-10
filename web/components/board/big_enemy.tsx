import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import { MdArrowCircleUp } from "react-icons/md";
import { ENEMY_Z_INDEX, TILE_SIZE } from "../../lib/constants";
import { TeleAnimData } from "../../../elara-lib/pkg/elara_lib";
import { Offset } from "../../lib/utils";
import { getSpriteAnimations } from "./anim_utils";
import BoardHoverInfo from "./board_hover_info";
import MalfunctioningRoverPage from "./hover_info_pages/malfunctioning_rover.mdx";

interface BigEnemyProps {
  offset: Offset;
  animState: string;
  animData?: TeleAnimData;
  enableAnimations: boolean;
  facing: string;
  enableHoverInfo: boolean;
}

export default function BigEnemy(props: BigEnemyProps) {
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

  // TODO(albrow): Add diagonal directions.
  const arrowRotation = useMemo(() => {
    switch (props.facing) {
      case "up_right":
        return 45;
      case "right":
        return 90;
      case "down_right":
        return 135;
      case "down":
        return 180;
      case "down_left":
        return 225;
      case "left":
        return 270;
      case "up_left":
        return 315;
      default:
        return 0;
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
        <BoardHoverInfo page={MalfunctioningRoverPage} offset={props.offset} />
      )}
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
        <Box
          w={`${TILE_SIZE * 3}px`}
          h={`${TILE_SIZE * 3}px`}
          border="3px solid red"
          zIndex={ENEMY_Z_INDEX}
        >
          <Box
            position="relative"
            top="0"
            left="0"
            zIndex={ENEMY_Z_INDEX + 1}
            transform={`rotateZ(${arrowRotation}deg)`}
          >
            <MdArrowCircleUp size={TILE_SIZE * 3} />
          </Box>
          {/* <Box
            // If the rover is facing to the side, the perspective means that the body
            // of the rover is shorter in the y dimension. To compensate, we scale the
            // lightning effect down so it matches more closely with the rover body.
            position="relative"
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
                top: `${TILE_SIZE * 0.2}px`,
                left: `${TILE_SIZE * 0.2}px`,
                width: `${TILE_SIZE * 1.5}px`,
                height: `${TILE_SIZE * 1.5}px`,
                zIndex: ENEMY_Z_INDEX + 2,
                filter:
                  "drop-shadow(0px 0px 4px rgba(255, 0, 0, 0.9)) saturate(200%) brightness(150%)",
              }}
            />
          </Box> */}
        </Box>
      </Box>
    </>
  );
}
