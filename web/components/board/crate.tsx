import { Image } from "@chakra-ui/react";
import { useMemo } from "react";

import {
  SPRITE_DROP_SHADOW,
  CRATE_Z_INDEX,
  CSS_ANIM_DURATION,
  PLAYER_DEFAULT_CSS_ANIM_DELAY,
} from "../../lib/constants";
import redCrateImgUrl from "../../images/board/crate_red.png";
import blueCrateImgUrl from "../../images/board/crate_blue.png";
import greenCrateImgUrl from "../../images/board/crate_green.png";
import { Offset } from "../../lib/utils";
import { CSSAnimation } from "./anim_utils";
import BoardHoverInfo from "./board_hover_info";
import CratePage from "./hover_info_pages/crate.mdx";

interface CrateProps {
  offset: Offset;
  color: "red" | "blue" | "green";
  held: boolean;
  enableAnimations: boolean;
  enableHoverInfo: boolean;
}

export default function Crate(props: CrateProps) {
  const imgUrl = useMemo(() => {
    switch (props.color) {
      case "red":
        return redCrateImgUrl;
      case "blue":
        return blueCrateImgUrl;
      case "green":
        return greenCrateImgUrl;
      default:
        throw new Error(`Invalid crate color: ${props.color}`);
    }
  }, [props.color]);

  // If animations are enabled, always animate the position of the crate
  // Note: This should always match the player animation so that the crate
  // moves with the player.
  const animation = useMemo((): CSSAnimation => {
    if (!props.enableAnimations) {
      return { style: { transition: "none" } };
    }

    return {
      style: {
        animation: "none",
        transition:
          `left ${CSS_ANIM_DURATION}s ${PLAYER_DEFAULT_CSS_ANIM_DELAY}s, ` +
          `top ${CSS_ANIM_DURATION}s ${PLAYER_DEFAULT_CSS_ANIM_DELAY}s, ` +
          `width ${CSS_ANIM_DURATION}s 0.3s, ` +
          `height ${CSS_ANIM_DURATION}s 0.3s, ` +
          `margin ${CSS_ANIM_DURATION}s 0.3s`,
      },
    };
  }, [props.enableAnimations]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo page={CratePage} offset={props.offset} />
      )}
      <Image
        alt=""
        src={imgUrl}
        w={props.held ? "32px" : "48px"}
        h={props.held ? "32px" : "48px"}
        mt={props.held ? "2px" : "1px"}
        ml={props.held ? "8px" : "1px"}
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        zIndex={CRATE_Z_INDEX}
        filter={SPRITE_DROP_SHADOW}
        style={animation.style}
      />
    </>
  );
}
