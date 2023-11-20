import { Box } from "@chakra-ui/react";
import { useMemo, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { YouTubePlayerProps } from "react-player/youtube";
import { VimeoPlayerProps } from "react-player/vimeo";
import { FilePlayerProps } from "react-player/file";

import { useSaveData } from "../../hooks/save_data_hooks";

export interface VideoProps {
  youTubeId: string;
  localVideoUrl?: string;
}

export default function Video(props: VideoProps) {
  const [saveData] = useSaveData();
  const playerRef = useRef<ReactPlayer | null>(null);

  const videoUrl = useMemo(() => {
    if (ELARA_BUILD_TARGET === "electron") {
      if (!props.localVideoUrl) {
        throw new Error("localVideoUrl is required when building for electron");
      }
      return props.localVideoUrl;
    }
    return `https://www.youtube.com/watch?v=${props.youTubeId}`;
  }, [props.localVideoUrl, props.youTubeId]);

  // Automatically adjust volume based on master volume setting.
  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.setState(
      (state: YouTubePlayerProps | VimeoPlayerProps | FilePlayerProps) => ({
        ...state,
        volume: saveData.settings.masterVolume,
      })
    );
  }, [saveData.settings.masterVolume]);

  return (
    <Box mt="30px" mb="40px">
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="852px"
        height="480px"
        style={{ margin: "auto", borderColor: "gray", borderWidth: "1px" }}
        controls
        volume={saveData.settings.masterVolume}
      />
    </Box>
  );
}
