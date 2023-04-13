import { Box, Text } from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";
import { Animate, AnimateKeyframes } from "react-simple-animate";

import ObjectiveText from "../objective_text";

export interface ModalObjectiveProps {
  objective: string;
  // The sequenceIndex to start the animation elements at. Subsequent elements
  // within this component may use animIndexStart + 1, animIndexStart + 2, etc.
  animIndexStart: number;
}

export default function ModalObjective(props: ModalObjectiveProps) {
  return (
    <Animate
      sequenceIndex={props.animIndexStart}
      delay={0.5}
      start={{ opacity: 0 }}
      end={{ opacity: 1 }}
    >
      <Box mx="auto" mt="15px" textAlign="center">
        <AnimateKeyframes
          sequenceIndex={props.animIndexStart + 1}
          play
          keyframes={[
            { 0: "opacity: 0%; transform: scale(3);" },
            { 100: "opacity: 100%; transform: scale(1);" },
          ]}
          fillMode="forwards"
          direction="normal"
          render={({ style }) => (
            <MdCheckCircle
              size="1.1em"
              color="var(--chakra-colors-green-400)"
              style={{
                opacity: "0%",
                marginRight: "0.2rem",
                display: "inline",
                verticalAlign: "middle",
                ...style,
              }}
            />
          )}
        />
        <Text as="span" verticalAlign="middle" fontWeight="bold">
          Objective:
        </Text>{" "}
        <ObjectiveText text={props.objective} />
      </Box>
    </Animate>
  );
}
