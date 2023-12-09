import { Box, Text } from "@chakra-ui/react";

/**
 * This component is used to help with responsive design.
 *
 * It shows the current size/breakpoint of the screen in the bottom corners.
 *
 */
export default function SizingUtility() {
  return (
    <>
      {/* General breakpoints */}
      <Box position="fixed" bottom="5px" right="5px">
        <Text size="2em" color="yellow" display={{ sm: "block", md: "none" }}>
          sm
        </Text>
        <Text
          size="2em"
          color="yellow"
          display={{ base: "none", md: "block", lg: "none" }}
        >
          md
        </Text>
        <Text
          size="2em"
          color="yellow"
          display={{ base: "none", lg: "block", xl: "none" }}
        >
          lg
        </Text>

        <Text
          size="2em"
          color="yellow"
          display={{ base: "none", xl: "block", "2xl": "none" }}
        >
          xl
        </Text>
        <Text
          size="2em"
          color="yellow"
          display={{ base: "none", "2xl": "block", "3xl": "none" }}
        >
          2xl
        </Text>
        <Text
          size="2em"
          color="yellow"
          display={{ base: "none", "3xl": "block" }}
        >
          3xl
        </Text>
      </Box>
    </>
  );
}
