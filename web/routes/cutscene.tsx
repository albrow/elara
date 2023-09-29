import { useCallback, useMemo } from "react";

import FullscreenVideo from "../components/cutscene/fullscreen_video";
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

  const CUTSCENE_METADATA: Record<
    CutsceneProps["cutsceneId"],
    CutsceneMetadata
  > = useMemo(
    () => ({
      intro: {
        vimeoVideoId: 867291789,
        youTubeVideoId: "xoE_SUpf2HM",
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

  return (
    <FullscreenVideo
      youtubeVideoId={youTubeVideoId}
      vimeoVideoId={vimeoVideoId}
      onEnd={onEnd}
      checkpoints={checkpoints}
    />
  );
}
