import { MdOutlineWarningAmber } from "react-icons/md";
import { Box, Image } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";

import {
  ROCK_Z_INDEX,
  SPRITE_DROP_SHADOW,
  TILE_SIZE,
} from "../../lib/constants";
import rockImgUrl from "../../images/board/rock.png";
import { Offset } from "../../lib/utils";
import AsteroidWarningPage from "./hover_info_pages/asteroid_warning.mdx";
import BoardHoverInfo from "./board_hover_info";

interface RockProps {
  offset: Offset;
  fuzzy: boolean;
  enableHoverInfo: boolean;
}

export default function Rock(props: RockProps) {
  if (props.fuzzy) {
    // "Fuzzy" in this context means that there may or may not be an
    // asteroid strike at this location. Use a flashing warning icon to
    // indicate this.
    return (
      <>
        {props.enableHoverInfo && (
          <BoardHoverInfo page={AsteroidWarningPage} offset={props.offset} />
        )}
        <Box
          position="absolute"
          left={props.offset.left}
          top={props.offset.top}
          w={`${TILE_SIZE}px`}
          h={`${TILE_SIZE}px`}
          zIndex={ROCK_Z_INDEX}
          pt="5px"
        >
          <AnimateKeyframes
            play
            duration={0.85}
            direction="alternate"
            iterationCount="infinite"
            keyframes={["opacity: 0", "opacity: 1"]}
          >
            <MdOutlineWarningAmber
              size="40px"
              color="var(--chakra-colors-red-500)"
              style={{
                margin: "auto",
              }}
            />
          </AnimateKeyframes>
        </Box>
      </>
    );
  }
  return (
    <Image
      alt="rock"
      src={rockImgUrl}
      w="48px"
      h="48px"
      position="absolute"
      left={props.offset.left}
      top={props.offset.top}
      zIndex={ROCK_Z_INDEX}
      filter={SPRITE_DROP_SHADOW}
    />
  );
}
