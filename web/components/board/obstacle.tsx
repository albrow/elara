import { MdOutlineWarningAmber } from "react-icons/md";

import { Box } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";
import { Offset } from "../../lib/utils";
import { TILE_SIZE, WALL_Z_INDEX } from "../../lib/constants";
import rockImgUrl from "../../images/rock.png";

interface ObstacleProps {
  offset: Offset;
  fuzzy: boolean;
}

export default function Obstacle(props: ObstacleProps) {
  if (props.fuzzy) {
    // "Fuzzy" in this context means that there may or may not be an
    // astroid strike at this location. Use a flashing warning icon to
    // indicate this.
    return (
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE - 1}px`}
        h={`${TILE_SIZE - 1}px`}
        zIndex={WALL_Z_INDEX}
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
    );
  }
  return (
    <img
      className="rock sprite"
      alt="rock"
      src={rockImgUrl}
      style={{
        position: "absolute",
        width: `${TILE_SIZE - 1}px`,
        height: `${TILE_SIZE - 1}px`,
        zIndex: WALL_Z_INDEX,
        left: props.offset.left,
        top: props.offset.top,
      }}
    />
  );
}
