import { useCallback, useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";
import { Box, Button, Text } from "@chakra-ui/react";
import { MdSkipNext } from "react-icons/md";
import { Animate } from "react-simple-animate";

import { useSceneNavigator } from "../hooks/scenes_hooks";

export interface FullscreenVideoProps {
  videoId: number;
  onEnd: () => void;
}

export default function FullscreenVideo(props: FullscreenVideoProps) {
  const videoIframeRef = useRef<HTMLIFrameElement>(null);
  const { navigateToHub } = useSceneNavigator();
  const [isWaitingForSkipConfirm, setIsWaitingForSkipConfirm] =
    useState<boolean>(false);

  const handleSkipOrEnd = useCallback(() => {
    videoIframeRef.current?.remove();
    props.onEnd();
  }, [props]);

  const waitForSkipConfirm = useCallback(() => {
    setIsWaitingForSkipConfirm(true);
  }, []);

  const handleSkipCancel = useCallback(() => {
    setIsWaitingForSkipConfirm(false);
  }, []);

  useEffect(() => {
    if (!videoIframeRef.current) return;
    const player = new Player(videoIframeRef.current, {
      id: props.videoId,
      autoplay: true,
      controls: false,
      loop: false,
      dnt: true,
      pip: false,
    });
    player.on("ended", () => {
      handleSkipOrEnd();
    });
  }, [handleSkipOrEnd, navigateToHub, props, props.videoId, videoIframeRef]);

  return (
    <>
      <Box w="100vw" h="100vh">
        <iframe
          title="video"
          ref={videoIframeRef}
          src={`https://player.vimeo.com/video/${props.videoId}?autoplay=true&controls=false&loop=false&dnt=true&pip=false`}
          width="100%"
          height="100%"
          frameBorder="0"
          // @ts-ignore
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          allowFullScreen
        />
      </Box>
      <Animate
        play
        start={{
          opacity: 0,
        }}
        end={{
          opacity: 1,
        }}
        delay={1.0}
        duration={1.0}
      >
        <Box
          position="fixed"
          right="32px"
          top="8px"
          py="16px"
          px="24px"
          borderRadius="8px"
          bg={isWaitingForSkipConfirm ? "blackAlpha.600" : "transparent"}
        >
          {isWaitingForSkipConfirm && (
            <>
              <Text as="span" color="white" mr="12px" textShadow="outline">
                You won&apos;t be able to view this cutscene later. Are you
                sure?
              </Text>
              <Button
                onClick={() => handleSkipCancel()}
                variant="outline"
                mr="10px"
                size="sm"
                color="white"
                _hover={{
                  color: "black",
                  bgColor: "white",
                }}
                _active={{
                  color: "black",
                  bgColor: "white",
                }}
              >
                No
              </Button>
              <Button
                onClick={() => handleSkipOrEnd()}
                variant="outline"
                size="sm"
                color="white"
                _hover={{
                  color: "black",
                  bgColor: "white",
                }}
                _active={{
                  color: "black",
                  bgColor: "white",
                }}
              >
                Yes
              </Button>
            </>
          )}
          {!isWaitingForSkipConfirm && (
            <Button
              onClick={() => waitForSkipConfirm()}
              variant="outline"
              color="white"
              bgColor="blackAlpha.600"
              _hover={{
                color: "black",
                bgColor: "white",
                shadow: "0px 0px 6px black",
              }}
              _active={{
                color: "black",
                bgColor: "white",
                shadow: "0px 0px 6px black",
              }}
            >
              Skip
              <MdSkipNext
                size="1.3em"
                style={{ marginLeft: "0.2em", verticalAlign: "middle" }}
              />
            </Button>
          )}
        </Box>
      </Animate>
    </>
  );
}
