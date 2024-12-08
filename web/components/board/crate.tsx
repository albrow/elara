import { Box, Image } from "@chakra-ui/react";
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
import {
  Offset,
  SpriteDimensions,
  getDefaultSpriteDims,
  getTileSize,
} from "../../lib/board_utils";
import { CSSAnimation } from "./anim_utils";
import BoardHoverInfo from "./board_hover_info";
import CratePage from "./hover_info_pages/crate.mdx";

interface CrateProps {
  offset: Offset;
  color: "red" | "blue" | "green";
  held: boolean;
  enableAnimations: boolean;
  enableHoverInfo: boolean;
  scale: number;
  filter?: string;
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

  const crateDims: SpriteDimensions = useMemo(() => {
    if (props.held) {
      return {
        width: 32 * props.scale,
        height: 32 * props.scale,
        marginLeft: 9 * props.scale,
        marginTop: 2 * props.scale,
      };
    }
    return getDefaultSpriteDims(props.scale);
  }, [props.held, props.scale]);
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);

  // If animations are enabled animate the position of the crate.
  // Outer animations apply to the crate's position on the board.
  // Note: This should always match the player animation so that the crate
  // moves with the player.
  const outerAnimations = useMemo((): CSSAnimation => {
    if (!props.enableAnimations) {
      return { style: { transition: "none" } };
    }

    return {
      style: {
        animation: "none",
        transition:
          `left ${CSS_ANIM_DURATION}s ${PLAYER_DEFAULT_CSS_ANIM_DELAY}s, ` +
          `top ${CSS_ANIM_DURATION}s ${PLAYER_DEFAULT_CSS_ANIM_DELAY}s`,
      },
    };
  }, [props.enableAnimations]);

  // If animations are enabled, animate the size of the crate and its margins.
  // Inner animations apply to the crate sprite itself.
  const innerAnimations = useMemo((): CSSAnimation => {
    if (!props.enableAnimations) {
      return { style: { transition: "none" } };
    }

    return {
      style: {
        animation: "none",
        transition:
          `width ${CSS_ANIM_DURATION}s 0.3s, ` +
          `height ${CSS_ANIM_DURATION}s 0.3s, ` +
          `margin ${CSS_ANIM_DURATION}s 0.3s`,
      },
    };
  }, [props.enableAnimations]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={CratePage}
          offset={props.offset}
          scale={props.scale}
        />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${tileSize}px`}
        h={`${tileSize}px`}
        zIndex={CRATE_Z_INDEX}
        filter={props.filter}
        style={outerAnimations.style}
      >
        <Image
          src={imgUrl}
          w={`${crateDims.width}px`}
          h={`${crateDims.height}px`}
          mt={`${crateDims.marginTop}px`}
          ml={`${crateDims.marginLeft}px`}
          filter={SPRITE_DROP_SHADOW}
          style={innerAnimations.style}
        />
      </Box>
    </>
  );
}
