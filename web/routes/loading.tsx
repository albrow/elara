import { Box, Button, Container, Text } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";
import { AiOutlineLoading } from "react-icons/ai";
import { MdPlayArrow } from "react-icons/md";

import { useRouter } from "react-router5";
import { useCallback, useEffect, useState } from "react";

import { useSceneNavigator } from "../hooks/scenes_hooks";

const LOAD_TIME_MS = 1000;

export interface LoadingProps {
  destination?: string;
}

export default function Loading(props: LoadingProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { navigateToTitle } = useSceneNavigator();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, LOAD_TIME_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const handlePlay = useCallback(() => {
    const dest = props.destination || "title";

    if (dest === "title") {
      navigateToTitle();
    } else {
      router.navigate(dest);
    }
  }, [navigateToTitle, props.destination, router]);

  return (
    <Box w="100%" h="100%" bg="black" position="fixed">
      <Container
        maxW="container.md"
        position="relative"
        top="40%"
        transform="translateY(-40%)"
        textAlign="center"
      >
        {isLoading && (
          <Box w="100%" textAlign="center">
            <AnimateKeyframes
              keyframes={[
                "transform: rotateZ(0deg)",
                "transform: rotateZ(-360deg)",
              ]}
              play
              iterationCount="infinite"
              duration={0.75}
            >
              <AiOutlineLoading
                color="white"
                size="3em"
                style={{ marginLeft: "auto", marginRight: "auto" }}
              />
            </AnimateKeyframes>
          </Box>
        )}
        {!isLoading && (
          <Box>
            <Button size="lg" colorScheme="blue" onClick={handlePlay}>
              <MdPlayArrow size="1.3em" style={{ marginRight: "0.2em" }} />
              Play
            </Button>
          </Box>
        )}
        <Text my="20px" color="white" fontSize="1.5em">
          {isLoading ? "Loading..." : "Ready!"}
        </Text>
      </Container>
    </Box>
  );
}

Loading.defaultProps = {
  destination: "/title",
};
