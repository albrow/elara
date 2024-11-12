import { Box, Text } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";
import { MdCircle } from "react-icons/md";

interface BoardDecorationProps {
  text: string;
}

export default function BoardDecoration(props: BoardDecorationProps) {
  return (
    <Box w="100%" h="21px" bg="gray.800" roundedTop="md" alignContent="center">
      <Text
        color="white"
        fontSize="xx-small"
        fontFamily="mono"
        verticalAlign="middle"
        w="fit-content"
        mr="2px"
        px="4px"
        float="right"
      >
        {props.text}
        <AnimateKeyframes
          play
          duration={1}
          direction="alternate"
          iterationCount="infinite"
          keyframes={["opacity: 0", "opacity: 1"]}
          render={({ style }) => (
            <MdCircle
              size="9px"
              style={{
                color: "var(--chakra-colors-blue-500)",
                marginTop: "-2px",
                display: "inline-block",
                marginLeft: "4px",
                verticalAlign: "middle",
                ...style,
              }}
            />
          )}
        />
      </Text>
    </Box>
  );
}
