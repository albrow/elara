import { MdOutlineWarningAmber } from "react-icons/md";
import { Box } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";

import { useMemo } from "react";
import { ASTEROID_WARNING_Z_INDEX } from "../../lib/constants";
import { Offset, getTileSize } from "../../lib/board_utils";
import AsteroidWarningPage from "./hover_info_pages/asteroid_warning.mdx";
import BoardHoverInfo from "./board_hover_info";

interface AsteroidWarningProps {
  offset: Offset;
  enableHoverInfo: boolean;
  scale: number;
  filter?: string;
}

export default function AsteroidWarning(props: AsteroidWarningProps) {
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={AsteroidWarningPage}
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
        zIndex={ASTEROID_WARNING_Z_INDEX}
        pt="5px"
        filter={props.filter}
      >
        <AnimateKeyframes
          play
          duration={0.85}
          direction="alternate"
          iterationCount="infinite"
          keyframes={["opacity: 0", "opacity: 1"]}
        >
          <MdOutlineWarningAmber
            size={`${40 * props.scale}px`}
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
