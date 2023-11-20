import { useCallback, useMemo } from "react";

import FullscreenVideo from "../components/cutscene/fullscreen_video";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import { useSaveData } from "../hooks/save_data_hooks";

import introCutscene from "../videos/intro_cutscene.mp4";
import midgameCutscene from "../videos/midgame_cutscene.mp4";
import finalCutscene from "../videos/final_cutscene.mp4";

export interface CutsceneProps {
  cutsceneId: "intro" | "midgame" | "end";
}

interface CutsceneMetadata {
  vimeoVideoId: number;
  youTubeVideoId: string;
  localVideoUrl: string;
  navigateOnEnd: () => void;
  checkpoints?: number[];
  isWIP?: boolean;
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
        vimeoVideoId: 878140026,
        youTubeVideoId: "y0uOxlbF6Tk",
        localVideoUrl: introCutscene,
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      midgame: {
        vimeoVideoId: 878140313,
        youTubeVideoId: "TUl2pIq0vjA",
        localVideoUrl: midgameCutscene,
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      end: {
        vimeoVideoId: 878140421,
        youTubeVideoId: "ELexFB0FQys",
        localVideoUrl: finalCutscene,
        navigateOnEnd: () => {
          navigateToHub();
        },
        checkpoints: [72, 120],
      },
    }),
    [navigateToHub]
  );

  if (!CUTSCENE_METADATA[props.cutsceneId]) {
    throw new Error(`Unknown cutscene ID: ${props.cutsceneId}`);
  }
  const {
    vimeoVideoId,
    youTubeVideoId,
    localVideoUrl,
    navigateOnEnd,
    checkpoints,
    isWIP,
  } = CUTSCENE_METADATA[props.cutsceneId];

  const onEnd = useCallback(() => {
    markCutsceneSeen(props.cutsceneId);
    navigateOnEnd();
  }, [markCutsceneSeen, navigateOnEnd, props.cutsceneId]);

  return (
    <FullscreenVideo
      youtubeVideoId={youTubeVideoId}
      vimeoVideoId={vimeoVideoId}
      localVideoUrl={localVideoUrl}
      onEnd={onEnd}
      checkpoints={checkpoints}
      showWIP={isWIP || false}
    />
  );
}
