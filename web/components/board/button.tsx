import { Box } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import { Offset } from "../../lib/utils";
import {
  BOARD_TOTAL_HEIGHT,
  BOARD_TOTAL_WIDTH,
  BUTTON_WIRE_INDEX,
  BUTTON_Z_INDEX,
  TILE_SIZE,
} from "../../lib/constants";
import buttonImgUrl from "../../images/button.png";
import buttonPressedImgUrl from "../../images/button_pressed.png";
import { useSoundManager } from "../../hooks/sound_manager_hooks";
import BoardHoverInfo from "./board_hover_info";
import ButtonPage from "./hover_info_pages/button.mdx";

interface ButtonProps {
  offset: Offset;
  currentlyPressed: boolean;
  additionalInfo: string;
  connectionOffset: Offset | null;
  enableAnimations: boolean;
  // fuzzy: boolean;
}

export default function Button(props: ButtonProps) {
  const [wasPressed, setWasPressed] = useState(props.currentlyPressed);

  const { getSound, stopAllSoundEffects } = useSoundManager();
  const buttonPressOnSound = useMemo(
    () => getSound("button_press_on"),
    [getSound]
  );
  const buttonPressOffSound = useMemo(
    () => getSound("button_press_off"),
    [getSound]
  );

  const wirePoints = useMemo(() => {
    if (!props.connectionOffset) {
      return "";
    }
    return `${props.offset.leftNum + TILE_SIZE / 2},${
      props.offset.topNum + TILE_SIZE * 0.75
    } ${props.connectionOffset.leftNum + TILE_SIZE / 2},${
      props.connectionOffset.topNum + TILE_SIZE / 2
    }`;
  }, [props.connectionOffset, props.offset.leftNum, props.offset.topNum]);

  useEffect(() => {
    if (!props.enableAnimations) {
      stopAllSoundEffects();
      setWasPressed(false);
    } else if (props.currentlyPressed && !wasPressed) {
      setWasPressed(true);
      buttonPressOnSound.play();
    } else if (!props.currentlyPressed && wasPressed) {
      setWasPressed(false);
      buttonPressOffSound.play();
    }
  }, [
    props,
    stopAllSoundEffects,
    wasPressed,
    buttonPressOnSound,
    buttonPressOffSound,
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
          zIndex={BUTTON_WIRE_INDEX}
        >
          <svg width="100%" height="100%">
            <polyline
              stroke="var(--chakra-colors-gray-700)"
              strokeWidth="2px"
              fill="none"
              points={wirePoints}
              overflow="visible"
            />
            {props.currentlyPressed && (
              <polyline
                stroke="var(--chakra-colors-blue-400)"
                strokeDasharray="5 5"
                strokeWidth="2px"
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
      <BoardHoverInfo
        page={ButtonPage}
        offset={props.offset}
        additionalInfo={props.additionalInfo}
      />
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE - 1}px`}
        h={`${TILE_SIZE - 1}px`}
        zIndex={BUTTON_Z_INDEX}
        filter="drop-shadow(-2px 2px 2px rgba(0, 0, 0, 0.3))"
      >
        {props.currentlyPressed ? (
          <img
            alt="button_pressed"
            src={buttonPressedImgUrl}
            style={{
              width: `${TILE_SIZE - 2}px`,
              height: `${TILE_SIZE - 2}px`,
              marginTop: "1px",
              marginLeft: "1px",
            }}
          />
        ) : (
          <img
            alt="button"
            src={buttonImgUrl}
            style={{
              width: `${TILE_SIZE - 2}px`,
              height: `${TILE_SIZE - 2}px`,
              marginTop: "1px",
              marginLeft: "1px",
            }}
          />
        )}
      </Box>
    </>
  );
}
