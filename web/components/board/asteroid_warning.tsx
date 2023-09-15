import { MdOutlineWarningAmber } from "react-icons/md";
import { Box } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";

import { ASTEROID_WARNING_Z_INDEX, TILE_SIZE } from "../../lib/constants";
import { Offset } from "../../lib/utils";
import AsteroidWarningPage from "./hover_info_pages/asteroid_warning.mdx";
import BoardHoverInfo from "./board_hover_info";

interface RockProps {
  offset: Offset;
  enableHoverInfo: boolean;
}

export default function Rock(props: RockProps) {
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
        zIndex={ASTEROID_WARNING_Z_INDEX}
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
