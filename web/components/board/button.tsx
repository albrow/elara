import { Box, Image } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { Offset } from "../../lib/utils";
import {
  BOARD_TOTAL_HEIGHT,
  BOARD_TOTAL_WIDTH,
  BUTTON_WIRE_Z_INDEX,
  BUTTON_Z_INDEX,
  SPRITE_DROP_SHADOW,
  TILE_SIZE,
  WIRE_DROP_SHADOW,
} from "../../lib/constants";
import buttonImgUrl from "../../images/board/button.png";
import buttonPressedImgUrl from "../../images/board/button_pressed.png";
import { useSoundManager } from "../../hooks/sound_manager_hooks";
import BoardHoverInfo from "./board_hover_info";
import ButtonPage from "./hover_info_pages/button.mdx";

interface ButtonProps {
  offset: Offset;
  currentlyPressed: boolean;
  additionalInfo: string;
  connectionOffset: Offset | null;
  enableAnimations: boolean;
  enableHoverInfo: boolean;
  wireColor: "blue" | "green";
}

export default function Button(props: ButtonProps) {
  // Amount of time to wait before we play the "unpress" animation and
  // sound effect.
  const BUTTON_PRESS_OFF_DELAY_MS = 500;

  // Refs used to access the wire and image elements. Used for
  // the "unpress" animation.
  const animatedWireRef = useRef<SVGPolylineElement | null>(null);
  const animationTimerRef = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const { getSound } = useSoundManager();
  const buttonPressOnSound = useMemo(
    () => getSound("button_press_on"),
    [getSound]
  );
  const buttonPressOffSound = useMemo(
    () => getSound("button_press_off"),
    [getSound]
  );
  const stopMySoundEffects = useCallback(() => {
    buttonPressOnSound.stop();
    buttonPressOffSound.stop();
  }, [buttonPressOnSound, buttonPressOffSound]);

  const wirePoints = useMemo(() => {
    if (!props.connectionOffset) {
      return "";
    }
    if (props.connectionOffset.leftNum <= props.offset.leftNum) {
      // Gate is to the left of the button. Draw a line to the top right corner.
      return `${props.offset.leftNum + TILE_SIZE / 2},${
        props.offset.topNum + TILE_SIZE * 0.75
      } ${props.connectionOffset.leftNum + TILE_SIZE * 0.92},${
        props.connectionOffset.topNum + TILE_SIZE * 0.4
      }`;
    }
    // Gate is to the right of the button. Draw a line to the bottom left corner.
    return `${props.offset.leftNum + TILE_SIZE / 2},${
      props.offset.topNum + TILE_SIZE * 0.75
    } ${props.connectionOffset.leftNum + TILE_SIZE * 0.08},${
      props.connectionOffset.topNum + TILE_SIZE * 0.9
    }`;
  }, [props.connectionOffset, props.offset.leftNum, props.offset.topNum]);

  const wireStrokeColor = useMemo(() => {
    if (props.wireColor === "blue") {
      return "var(--chakra-colors-blue-700)";
    }
    return "var(--chakra-colors-teal-700)";
  }, [props.wireColor]);

  const wireAnimStrokeColor = useMemo(() => {
    if (props.wireColor === "blue") {
      return "var(--chakra-colors-blue-400)";
    }
    return "var(--chakra-colors-teal-400)";
  }, [props.wireColor]);

  useEffect(() => {
    if (!props.enableAnimations) {
      stopMySoundEffects();
    }
    if (props.currentlyPressed) {
      // If the button is pressed, we always want to update the wire and image
      // to reflect this. We do this regardless of whether animations are enabled.
      animatedWireRef.current?.setAttribute("stroke", wireAnimStrokeColor);
      imgRef.current?.setAttribute("src", buttonPressedImgUrl);
      if (props.enableAnimations) {
        // If the button is pressed *and* animations are enabled, we play a "press on"
        // sound effect, then after 500ms we play a "press off" sound effect and update
        // the wire and image to reflect that the button is no longer pressed.
        buttonPressOnSound.play();
        if (animationTimerRef.current) {
          clearTimeout(animationTimerRef.current);
        }
        animationTimerRef.current = window.setTimeout(() => {
          buttonPressOnSound.stop();
          buttonPressOffSound.play();
          animatedWireRef.current?.setAttribute("stroke", "transparent");
          imgRef.current?.setAttribute("src", buttonImgUrl);
        }, BUTTON_PRESS_OFF_DELAY_MS);
      }
    }

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [
    props,
    stopMySoundEffects,
    buttonPressOnSound,
    buttonPressOffSound,
    wireAnimStrokeColor,
  ]);

  return (
    <>
      {props.connectionOffset && (
        // Draw a wire from the button to whatever the button is connected to.
        //
        // TODO(albrow): Make the wire a little more loopy and natural looking
        // instead of just being a straight line.
        <Box
          position="absolute"
          left={0}
          top={0}
          w={BOARD_TOTAL_WIDTH}
          h={BOARD_TOTAL_HEIGHT}
          overflow="visible"
          zIndex={BUTTON_WIRE_Z_INDEX}
        >
          <svg
            width="100%"
            height="100%"
            style={{
              filter: WIRE_DROP_SHADOW,
            }}
          >
            <polyline
              stroke={wireStrokeColor}
              strokeWidth="3px"
              fill="none"
              points={wirePoints}
              overflow="visible"
            />
            {props.currentlyPressed && (
              <polyline
                ref={animatedWireRef}
                stroke={wireAnimStrokeColor}
                strokeDasharray="5 5"
                strokeWidth="3px"
                fill="none"
                points={wirePoints}
                overflow="visible"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0; -20"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </polyline>
            )}
          </svg>
        </Box>
      )}
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={ButtonPage}
          offset={props.offset}
          additionalInfo={props.additionalInfo}
        />
      )}
      <Image
        ref={imgRef}
        alt="button"
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        zIndex={BUTTON_Z_INDEX}
        src={props.currentlyPressed ? buttonPressedImgUrl : buttonImgUrl}
        w="48px"
        h="48px"
        mt="1px"
        ml="1px"
        filter={SPRITE_DROP_SHADOW}
      />
    </>
  );
}
