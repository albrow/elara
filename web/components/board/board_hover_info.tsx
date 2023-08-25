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
  page: <T extends MDXProps>(props: T) => JSX.Element;
  additionalInfo?: string;
  // Width of the thing we're hovering over (in board spaces)
  // Defaults to 1.
  width?: number;
  // Height of the thing we're hovering over (in board spaces)
  // Defaults to 1.
  height?: number;
}

export default function BoardHoverInfo(props: BoardHoverInfoProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Width of the hover info in pixels.
  const pixelWidth = 400;

  // If the hover info is too close to the right or left edge of the screen, we
  // offset it so that it doesn't hang off the edge.
  const rightOffset = useMemo(() => {
    if (props.offset.leftNum + pixelWidth > BOARD_INNER_WIDTH) {
      // Would hang off the right.
      if (props.offset.leftNum - pixelWidth < 0) {
        // Would hang off the left too. Position in the middle.
        return `${props.offset.leftNum - pixelWidth}px`;
      }
      // Would hang off the right, but not the left.
      return "0px";
    }
    return "auto";
  }, [props.offset.leftNum]);

  // Bottom offset is used to make sure the hover info doesn't hang off the top or
  // bottom of the screen.
  const bottomOffset = useMemo(() => {
    if (props.offset.pos && props.offset.pos.y + props.height! <= 5) {
      return `auto`;
    }

    return `100%`;
  }, [props.height, props.offset.pos]);

  return (
    <Box
      position="absolute"
      zIndex={BOARD_HOVER_INFO_Z_INDEX}
      left={props.offset.left}
      top={props.offset.top}
      w={`${TILE_SIZE * props.width!}px`}
      h={`${TILE_SIZE * props.height!}px`}
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
            zIndex={BOARD_HOVER_INFO_Z_INDEX + 1}
            bg="gray.200"
            border="1px"
            borderColor="gray.500"
            position="absolute"
            bottom={bottomOffset}
            right={rightOffset}
            w={`${pixelWidth}px`}
            py="5px"
            px="12px"
            boxShadow="2px 2px 10px"
            _hover={{ cursor: "text" }}
          >
            <Box className="md-content hover-doc">
              <props.page additionalInfo={props.additionalInfo} />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

BoardHoverInfo.defaultProps = {
  width: 1,
  height: 1,
};
