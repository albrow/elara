import { useCallback, useMemo } from "react";

import FullscreenVideo from "../components/fullscreen_video";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import { useSaveData } from "../hooks/save_data_hooks";

export interface CutsceneProps {
  cutsceneId: "intro" | "midgame" | "end";
}

interface CutsceneMetadata {
  videoId: number;
  navigateOnEnd: () => void;
  checkpoints?: number[];
}

export default function Cutscene(props: CutsceneProps) {
  const { navigateToHub } = useSceneNavigator();
  const [_, { markCutsceneSeen }] = useSaveData();

  const CUTSCENE_METADATA: Record<
    CutsceneProps["cutsceneId"],
    CutsceneMetadata
  > = useMemo(
    () => ({
      intro: {
        videoId: 862764545,
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      midgame: {
        videoId: 862789284,
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      end: {
        videoId: 862987802,
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
  const { videoId, navigateOnEnd, checkpoints } =
    CUTSCENE_METADATA[props.cutsceneId];

  const onEnd = useCallback(() => {
    markCutsceneSeen(props.cutsceneId);
    navigateOnEnd();
  }, [markCutsceneSeen, navigateOnEnd, props.cutsceneId]);

  return (
    <FullscreenVideo
      videoId={videoId}
      onEnd={onEnd}
      checkpoints={checkpoints}
    />
  );
}
