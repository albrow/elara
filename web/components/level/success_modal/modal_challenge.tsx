import { Box, Text } from "@chakra-ui/react";
import { Animate, AnimateKeyframes } from "react-simple-animate";
import { useCallback, useMemo } from "react";
import { BsStarFill, BsStar } from "react-icons/bs";

import { RunResult } from "../../../../elara-lib/pkg/elara_lib";
import ChallengeText from "../challenge_text";
import { useCurrScene } from "../../../hooks/scenes_hooks";

export interface ModalChallengeProps {
  result: RunResult;
  // The sequenceIndex to start the animation elements at. Subsequent elements
  // within this component may use animIndexStart + 1, animIndexStart + 2, etc.
  animIndexStart: number;
}

export default function ModalChallenge(props: ModalChallengeProps) {
  const currScene = useCurrScene();
  const currLevel = useMemo(() => currScene?.level, [currScene]);
  if (!currLevel) {
    throw new Error("currLevel must be non-null");
  }

  const getChallengeIcon = useCallback(() => {
    if (props.result.passes_challenge) {
      return (
        <AnimateKeyframes
          sequenceIndex={props.animIndexStart + 1}
          play
          keyframes={[
            { 0: "opacity: 0%; transform: scale(4) rotate(360deg);" },
            { 100: "opacity: 100%; transform: scale(1) rotate(0deg);" },
          ]}
          fillMode="forwards"
          direction="normal"
          render={({ style }) => (
            <BsStarFill
              size="1.1em"
              color="var(--chakra-colors-yellow-400)"
              style={{
                opacity: 0,
                marginRight: "0.2rem",
                display: "inline",
                verticalAlign: "middle",
                ...style,
              }}
            />
          )}
        />
      );
    }
    return (
      <BsStar
        size="1.1em"
        color="var(--chakra-colors-gray-400)"
        style={{
          marginRight: "0.2rem",
          display: "inline",
          verticalAlign: "middle",
        }}
      />
    );
  }, [props.animIndexStart, props.result.passes_challenge]);

  return (
    <Animate
      sequenceIndex={props.animIndexStart}
      delay={0.5}
      start={{ opacity: 0 }}
      end={{ opacity: 1 }}
    >
      <Box mx="auto" mt="15px" textAlign="center">
        {getChallengeIcon()}
        <Text as="span" verticalAlign="middle" fontWeight="bold">
          Challenge:
        </Text>{" "}
        <ChallengeText text={currLevel.challenge} />
        {!currScene?.challengeCompleted && !props.result.passes_challenge && (
          <Animate
            sequenceIndex={props.animIndexStart + 2}
            delay={0.1}
            start={{ opacity: 0 }}
            end={{ opacity: 1 }}
          >
            <Text fontStyle="italic" fontSize="sm">
              (You may need to learn more and then come back later.)
            </Text>
          </Animate>
        )}
        {props.result.passes_challenge &&
          currLevel.challenge.toLowerCase().includes("code length") && (
            <Animate
              sequenceIndex={props.animIndexStart + 2}
              delay={0.1}
              start={{ opacity: 0 }}
              end={{ opacity: 1 }}
            >
              <Text fontStyle="italic" fontSize="sm">
                (Keep in mind, writing <b>readable</b> code is often better than
                writing <b>short</b> code. This is just for fun!)
              </Text>
            </Animate>
          )}
      </Box>
    </Animate>
  );
}
