import { Box, Button, Container, Text } from "@chakra-ui/react";
import { AnimateKeyframes } from "react-simple-animate";
import { AiOutlineLoading } from "react-icons/ai";
import { MdPlayArrow } from "react-icons/md";

import { useRouter } from "react-router5";
import { useCallback, useEffect, useState } from "react";
import { useSoundManager } from "../hooks/sound_manager_hooks";

const LOAD_TIME_MS = 1000;
const SOUND_DELAY_TIME_MS = 200;

export interface LoadingProps {
  destination?: string;
}

export default function Loading(props: LoadingProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { getSound } = useSoundManager();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, LOAD_TIME_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [props.destination, router]);

  const handlePlay = useCallback(() => {
    const dest = props.destination || "title";
    router.navigate(dest);

    let timeout: NodeJS.Timeout | null = null;
    if (dest === "title") {
      const sound = getSound("music_prelude");
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        // TODO(albrow): Loop the music.
        sound.play();
      }, SOUND_DELAY_TIME_MS);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [getSound, props.destination, router]);

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
