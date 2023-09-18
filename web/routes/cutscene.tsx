import { useCallback, useEffect, useMemo, useState } from "react";

import FullscreenYouTubeVideo from "../components/cutscene/fullscreen_youtube_video";
import FullscreenVimeoVideo from "../components/cutscene/fullscreen_vimeo_video";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import { useSaveData } from "../hooks/save_data_hooks";

export interface CutsceneProps {
  cutsceneId: "intro" | "midgame" | "end";
}

interface CutsceneMetadata {
  vimeoVideoId: number;
  youTubeVideoId: string;
  navigateOnEnd: () => void;
  checkpoints?: number[];
}

export default function Cutscene(props: CutsceneProps) {
  const { navigateToHub } = useSceneNavigator();
  const [_, { markCutsceneSeen }] = useSaveData();
  const [isVimeoBlocked, setIsVimeoBlocked] = useState<boolean>(false);

  useEffect(() => {
    // Vimeo is blocked in some school systems. If we detect this,
    // fallback to the YouTube player.
    const req = new Request(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
        "https://vimeo.com/53145852"
      )}`
    );

    fetch(req)
      .then((res) => {
        if (res.status === 404) {
          setIsVimeoBlocked(false);
          return;
        }
        if (!res.ok) {
          setIsVimeoBlocked(true);
        }
      })
      .catch(() => {
        setIsVimeoBlocked(true);
      });
  }, []);

  const CUTSCENE_METADATA: Record<
    CutsceneProps["cutsceneId"],
    CutsceneMetadata
  > = useMemo(
    () => ({
      intro: {
        vimeoVideoId: 862764545,
        youTubeVideoId: "S1VpIP7ns9Y",
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      midgame: {
        vimeoVideoId: 862789284,
        youTubeVideoId: "aloLB3FONN0",
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      end: {
        vimeoVideoId: 862987802,
        youTubeVideoId: "T75iBxx6nbQ",
        navigateOnEnd: () => {
          navigateToHub();
        },
        checkpoints: [60, 94],
      },
    }),
    [navigateToHub]
  );

  if (!CUTSCENE_METADATA[props.cutsceneId]) {
    throw new Error(`Unknown cutscene ID: ${props.cutsceneId}`);
  }
  const { vimeoVideoId, youTubeVideoId, navigateOnEnd, checkpoints } =
    CUTSCENE_METADATA[props.cutsceneId];

  const onEnd = useCallback(() => {
    markCutsceneSeen(props.cutsceneId);
    navigateOnEnd();
  }, [markCutsceneSeen, navigateOnEnd, props.cutsceneId]);

  return isVimeoBlocked ? (
    <FullscreenYouTubeVideo
      videoId={youTubeVideoId}
      onEnd={onEnd}
      checkpoints={checkpoints}
    />
  ) : (
    <FullscreenVimeoVideo
      videoId={vimeoVideoId}
      onEnd={onEnd}
      checkpoints={checkpoints}
    />
  );
}
