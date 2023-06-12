import { Box } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import { Offset } from "../../lib/utils";
import { BUTTON_Z_INDEX, TILE_SIZE } from "../../lib/constants";
import buttonImgUrl from "../../images/button.png";
import buttonPressedImgUrl from "../../images/button_pressed.png";
import { useSoundManager } from "../../hooks/sound_manager_hooks";
import BoardHoverInfo from "./board_hover_info";
import ButtonPage from "./hover_info_pages/button.mdx";

interface ButtonProps {
  offset: Offset;
  currentlyPressed: boolean;
  additionalInfo: string;
  enableAnimations: boolean;
  // fuzzy: boolean;
}

// TODO(albrow): Draw connections on the UI between button and whatever
// it is connected to.
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
