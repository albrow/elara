import { useCallback, useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";
import { Box, Button, Text } from "@chakra-ui/react";
import { MdPlayArrow, MdSkipNext } from "react-icons/md";
import { Animate } from "react-simple-animate";

import { useSceneNavigator } from "../hooks/scenes_hooks";

export interface FullscreenVideoProps {
  videoId: number;
  onEnd: () => void;
}

// How long to wait before showing the play button.
// This is a fallback for platforms where autoplay doesn't work.
const FALLBACK_PLAY_BUTTON_DELAY = 1500;

export default function FullscreenVideo(props: FullscreenVideoProps) {
  const videoIframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);
  const { navigateToHub } = useSceneNavigator();
  const [isWaitingForSkipConfirm, setIsWaitingForSkipConfirm] =
    useState<boolean>(false);
  const [showPlayButton, setShowPlayButton] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const showPlayButtonTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const onVideoLoad = useCallback(() => {
    // Show the play button if the video hasn't started
    // after some period of time. This is a fallback for platforms
    // where autoplay doesn't work.
    if (showPlayButtonTimeout.current) {
      clearTimeout(showPlayButtonTimeout.current);
    }
    showPlayButtonTimeout.current = setTimeout(() => {
      if (!hasStarted) {
        setShowPlayButton(true);
      } else {
        setShowPlayButton(false);
      }
    }, FALLBACK_PLAY_BUTTON_DELAY);
  }, [hasStarted]);

  const onVideoStarted = useCallback(() => {
    setHasStarted(true);
    if (showPlayButtonTimeout.current) {
      clearTimeout(showPlayButtonTimeout.current);
    }
    setShowPlayButton(false);
  }, [showPlayButtonTimeout, setShowPlayButton, setHasStarted]);

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
    playerRef.current = player;
    player.on("play", onVideoStarted);
    player.on("loaded", onVideoLoad);
    player.on("ended", handleSkipOrEnd);
  }, [
    handleSkipOrEnd,
    hasStarted,
    navigateToHub,
    onVideoLoad,
    onVideoStarted,
    props,
    props.videoId,
    videoIframeRef,
  ]);

  const manualPlay = useCallback(() => {
    if (!playerRef.current) return;
    if (showPlayButtonTimeout.current) {
      clearTimeout(showPlayButtonTimeout.current);
    }
    try {
      playerRef.current.play();
      setShowPlayButton(false);
    } catch (e) {
      // On some browsers/platforms, the video will not play unless the user has interacted with the iframe
      // at least once. The play button unfortunately doesn't count since it is part of the main page.
      // eslint-disable-next-line no-alert
      alert(
        "Your browser does not support autoplay. Please click on the background of the video first, then click the play button."
      );
      setShowPlayButton(true);
    }
  }, [playerRef]);

  return (
    <>
      <Box w="100vw" h="100vh">
        {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
        <iframe
          ref={videoIframeRef}
          src={`https://player.vimeo.com/video/${props.videoId}?autoplay=true&controls=false&loop=false&dnt=true&pip=false`}
          width="100%"
          height="100%"
          frameBorder="0"
          // @ts-ignore
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          allowFullScreen
          allow="autoplay; fullscreen"
        />
      </Box>
      {showPlayButton && (
        <Box
          zIndex={200}
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Button onClick={manualPlay} variant="unstyled">
            <MdPlayArrow size="5em" color="white" />
          </Button>
        </Box>
      )}
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
          zIndex={100}
          position="fixed"
          right="32px"
          top="16px"
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
