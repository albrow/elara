import { MdOutlineWarningAmber } from "react-icons/md";
import { Box, Image } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";

import { useMemo } from "react";
import { posToOffset, rowBasedZIndex } from "../../lib/utils";
import { TILE_SIZE, OBSTACLE_Z_INDEX } from "../../lib/constants";
import rockImgUrl from "../../images/board/rock.png";
// import RockPage from "./hover_info_pages/rock.mdx";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import AsteroidWarningPage from "./hover_info_pages/asteroid_warning.mdx";
import BoardHoverInfo from "./board_hover_info";

interface ObstacleProps {
  pos: Pos;
  fuzzy: boolean;
  enableHoverInfo: boolean;
}

export default function Obstacle(props: ObstacleProps) {
  const offset = useMemo(() => posToOffset(props.pos), [props.pos]);
  const zIndex = useMemo(
    () => rowBasedZIndex(props.pos.y, OBSTACLE_Z_INDEX),
    [props.pos.y]
  );

  if (props.fuzzy) {
    // "Fuzzy" in this context means that there may or may not be an
    // asteroid strike at this location. Use a flashing warning icon to
    // indicate this.
    return (
      <>
        {props.enableHoverInfo && (
          <BoardHoverInfo page={AsteroidWarningPage} offset={offset} />
        )}
        <Box
          position="absolute"
          left={offset.left}
          top={offset.top}
          w={`${TILE_SIZE}px`}
          h={`${TILE_SIZE}px`}
          zIndex={zIndex}
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
    <>
      {/* Removing hover info for now because it can clutter the UI. Might reconsider later. */}
      {/* <BoardHoverInfo page={RockPage} offset={offset} /> */}
      <Image
        alt="rock"
        src={rockImgUrl}
        w="48px"
        h="48px"
        position="absolute"
        left={offset.left}
        top={offset.top}
        zIndex={zIndex}
      />
    </>
  );
}
