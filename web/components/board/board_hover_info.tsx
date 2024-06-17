import { Box } from "@chakra-ui/react";
import { useMemo, useState } from "react";

import { MDXProps } from "mdx/types";
import { BOARD_HOVER_INFO_Z_INDEX } from "../../lib/constants";
import { Offset, getBoardDimensions, getTileSize } from "../../lib/board_utils";

export const HOVER_DOC_BOX_SHADOW = "2px 2px 10px";

export interface BoardHoverInfoProps {
  offset: Offset;
  // Note the page prop *is* actually used.
  // eslint-disable-next-line react/no-unused-prop-types
  page: <T extends MDXProps>(props: T) => JSX.Element;
  scale: number;
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

  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);
  const boardDims = useMemo(
    () => getBoardDimensions(props.scale),
    [props.scale]
  );

  // Width of the hover info in pixels.
  const infoBoxWidth = useMemo(() => 400 * props.scale, [props.scale]);

  // If the hover info is too close to the right or left edge of the screen, we
  // offset it so that it doesn't hang off the edge.
  const rightOffset = useMemo(() => {
    if (props.offset.leftNum + infoBoxWidth > boardDims.innerWidth) {
      // Would hang off the right.
      if (props.offset.leftNum - infoBoxWidth < 0) {
        // Would hang off the left too. Position in the middle.
        return `${props.offset.leftNum - infoBoxWidth}px`;
      }
      // Would hang off the right, but not the left.
      return "0px";
    }
    return "auto";
  }, [boardDims.innerWidth, infoBoxWidth, props.offset.leftNum]);

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
      w={`${tileSize * props.width!}px`}
      h={`${tileSize * props.height!}px`}
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
            w={`${infoBoxWidth}px`}
            py={`${3 * props.scale}px`}
            px={`${12 * props.scale}px`}
            boxShadow={HOVER_DOC_BOX_SHADOW}
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
