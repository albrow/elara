import { Box } from "@chakra-ui/react";
import { useMemo, useState } from "react";

import { MDXProps } from "mdx/types";
import {
  BOARD_HOVER_INFO_Z_INDEX,
  BOARD_INNER_WIDTH,
  TILE_SIZE,
} from "../../lib/constants";
import { Offset } from "../../lib/utils";

export interface BoardHoverInfoProps {
  offset: Offset;
  // Note the page prop *is* actually used.
  // eslint-disable-next-line react/no-unused-prop-types
  page: (props: MDXProps) => JSX.Element;
}

export default function BoardHoverInfo(props: BoardHoverInfoProps) {
  const [isHovered, setIsHovered] = useState(false);

  const pixelWidth = 400;

  // If the hover info is too close to the right or left edge of the screen, we
  // offset it so that it doesn't hang off the edge.
  const rightOffset = useMemo(() => {
    if (props.offset.leftNum + pixelWidth > BOARD_INNER_WIDTH) {
      if (props.offset.leftNum - pixelWidth < 0) {
        return `${BOARD_INNER_WIDTH - pixelWidth}px`;
      }
      return `${pixelWidth - TILE_SIZE}px`;
    }
    return "0px";
  }, [props.offset.leftNum]);

  return (
    <Box
      position="absolute"
      zIndex={BOARD_HOVER_INFO_Z_INDEX}
      left={props.offset.left}
      top={props.offset.top}
      w={`${TILE_SIZE}px`}
      h={`${TILE_SIZE}px`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{ cursor: "help" }}
    >
      {isHovered && (
        <>
          {/* Highlight effect for the thing we're hovering over */}
          <Box
            w="100%"
            h="100%"
            filter="auto"
            brightness="40%"
            position="relative"
            boxShadow="inset 0px 0px 6px 0px var(--chakra-colors-blue-500)"
          />
          {/* Actual hover info */}
          <Box
            overflow="visible"
            zIndex={BOARD_HOVER_INFO_Z_INDEX}
            bg="gray.200"
            border="1px"
            borderColor="gray.500"
            position="relative"
            top="0px"
            right={rightOffset}
            w={`${pixelWidth}px`}
            py="5px"
            px="12px"
            boxShadow="2px 2px 10px"
          >
            <Box className="md-content hover-doc">
              <props.page />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
