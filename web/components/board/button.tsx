import { Image } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { BUTTON_Z_INDEX, SPRITE_DROP_SHADOW } from "../../lib/constants";
import { Offset, getDefaultSpriteDims } from "../../lib/board_utils";
import buttonImgUrl from "../../images/board/button.png";
import buttonPressedImgUrl from "../../images/board/button_pressed.png";
import { useSoundManager } from "../../hooks/sound_manager_hooks";
import BoardHoverInfo from "./board_hover_info";
import ButtonPage from "./hover_info_pages/button.mdx";

interface ButtonProps {
  offset: Offset;
  currentlyPressed: boolean;
  additionalInfo: string;
  enableAnimations: boolean;
  enableHoverInfo: boolean;
  scale: number;
}

// Amount of time to wait before we play the "unpress" animation and
// sound effect.
const BUTTON_PRESS_OFF_DELAY_MS = 500;

export default function Button(props: ButtonProps) {
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );

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

  // Track the previous state. Helps us determine whether we need
  // to play a sound effect.
  const prevState = useRef(props);

  useEffect(() => {
    if (!props.enableAnimations) {
      stopMySoundEffects();
    }
    if (props.currentlyPressed) {
      if (prevState.current?.currentlyPressed === props.currentlyPressed) {
        // No need to play a sound effect if the button state has not changed.
        return () => {};
      }

      // If the button is pressed, we always want to update the image
      // to reflect this. We do this regardless of whether animations are enabled.
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

    prevState.current = props;

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [props, stopMySoundEffects, buttonPressOnSound, buttonPressOffSound]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={ButtonPage}
          offset={props.offset}
          additionalInfo={props.additionalInfo}
          scale={props.scale}
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
        w={`${spriteDims.width}px`}
        h={`${spriteDims.height}px`}
        mt={`${spriteDims.marginTop}px`}
        ml={`${spriteDims.marginLeft}px`}
        filter={SPRITE_DROP_SHADOW}
      />
    </>
  );
}
