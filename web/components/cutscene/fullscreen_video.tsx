import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Text, AspectRatio } from "@chakra-ui/react";
import { MdSkipNext } from "react-icons/md";
import { Animate } from "react-simple-animate";

import ReactPlayer from "react-player";
import { YouTubePlayerProps } from "react-player/youtube";
import { VimeoPlayerProps } from "react-player/vimeo";
import { useSaveData } from "../../hooks/save_data_hooks";
import {
  getVimeoEmbedURLFromId,
  getYouTubeEmbedURLFromId,
} from "../../lib/utils";

// import { useSceneNavigator } from "../../hooks/scenes_hooks";

export interface FullscreenYouTubeVideoProps {
  vimeoVideoId: number;
  youtubeVideoId: string;
  onEnd: () => void;
  // If provided, pressing the skip button will skip to the next checkpoint
  // (in seconds) instead of the end of the video.
  checkpoints?: number[];
}

export default function FullscreenYouTubeVideo(
  props: FullscreenYouTubeVideoProps
) {
  const playerRef = useRef<ReactPlayer | null>(null);
  const [isWaitingForSkipConfirm, setIsWaitingForSkipConfirm] =
    useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [saveData, _] = useSaveData();
  const [currVideoUrl, setCurrVideoUrl] = useState<string>(
    getVimeoEmbedURLFromId(props.vimeoVideoId)
  );

  // Automatically adjust volume based on master volume setting.
  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.setState(
      (state: YouTubePlayerProps | VimeoPlayerProps) => ({
        ...state,
        volume: saveData.settings.masterVolume,
      })
    );
  }, [saveData.settings.masterVolume]);

  const onEnd = useCallback(() => {
    props.onEnd();
  }, [props]);

  const onSkipConfirm = useCallback(async () => {
    if (props.checkpoints && props.checkpoints.length > 0) {
      // Check if there are any checkpoints remaining after the current time.
      const currentTime = await playerRef.current?.getCurrentTime();
      if (currentTime) {
        const nextCheckpoint = props.checkpoints.find(
          (checkpoint) => checkpoint > currentTime
        );
        if (nextCheckpoint) {
          // Skip to the next checkpoint.
          playerRef.current?.seekTo(nextCheckpoint);
          setIsWaitingForSkipConfirm(false);
          setIsPlaying(true);
          return;
        }
      }
    }

    // No checkpoints remaining, so skip to the end.
    onEnd();
  }, [onEnd, props.checkpoints, playerRef]);

  const waitForSkipConfirm = useCallback(() => {
    setIsWaitingForSkipConfirm(true);
    setIsPlaying(false);
  }, []);

  const onSkipCancel = useCallback(() => {
    setIsWaitingForSkipConfirm(false);
    setIsPlaying(true);
  }, []);

  const fallbackToYouTube = useCallback(() => {
    const youtubeURL = getYouTubeEmbedURLFromId(props.youtubeVideoId);
    if (currVideoUrl !== youtubeURL) {
      setCurrVideoUrl(youtubeURL);
    }
  }, [currVideoUrl, props.youtubeVideoId]);

  return (
    <>
      <Box w="100%" h="100%" maxH="100vh" overflow="hidden">
        <AspectRatio ratio={16 / 9} maxH="100vh">
          <ReactPlayer
            ref={playerRef}
            style={{
              position: "absolute",
              top: "auto",
              left: "auto",
              maxHeight: "100vh",
            }}
            controls={false}
            url={currVideoUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            onEnded={onEnd}
            onError={fallbackToYouTube}
            volume={saveData.settings.masterVolume}
          />
        </AspectRatio>
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
                onClick={() => onSkipCancel()}
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
                onClick={() => onSkipConfirm()}
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
