import { AnimateKeyframes } from "react-simple-animate";
import { Text } from "@chakra-ui/react";

export interface BlinkingTextProps {
  text: string;
}

export default function BlinkingText(props: BlinkingTextProps) {
  return (
    <AnimateKeyframes
      play
      duration={1.5}
      direction="alternate"
      iterationCount="infinite"
      keyframes={[
        { 0: "opacity: 0" },
        { 33: "opacity: 1" },
        { 100: "opacity: 1" },
      ]}
    >
      <Text
        fontSize={{ base: "24px", "2xl": "32px" }}
        color="yellow.500"
        fontFamily="'Caveat', cursive;"
        textShadow="0px 0px 8px black"
        align="center"
      >
        {props.text}
      </Text>
    </AnimateKeyframes>
  );
}
