import { useState } from "react";
import { Box, VStack } from "@chakra-ui/react";

import { AXIS_LABEL_Z_INDEX, TILE_SIZE } from "../../lib/constants";

export interface SquareProps {
  x: number;
  y: number;
}

export default function Square(props: SquareProps) {
  let [isHovered, setIsHovered] = useState(false);

  return (
    <td
      className="square"
      style={{
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        className="coords"
        bg={isHovered ? "rgba(255, 255, 255, 0.8)" : "transparent"}
        zIndex={AXIS_LABEL_Z_INDEX}
        fontSize="xs"
        color="gray.700"
        fontWeight="bold"
        fontFamily="mono"
        position="relative"
        w="full"
        h="full"
        textAlign="center"
      >
        <VStack spacing={0} justify="center" h="full">
          <div>{isHovered ? `x=${props.x}` : ""}</div>
          <div>{isHovered ? `y=${props.y}` : ""}</div>
        </VStack>
      </Box>
    </td>
  );
}
