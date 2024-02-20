import { useCallback, useMemo } from "react";

import FullscreenVideo from "../components/cutscene/fullscreen_video";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import { useSaveData } from "../hooks/save_data_hooks";
import { getLocalVideoUrl } from "../lib/utils";

export interface CutsceneProps {
  cutsceneId: "intro" | "midgame" | "end";
}

interface CutsceneMetadata {
  vimeoVideoId: number;
  youTubeVideoId: string;
  localVideoUrl: string | null;
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
        localVideoUrl: getLocalVideoUrl("intro_cutscene"),
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      grover_damaged: {
        vimeoVideoId: 914609393,
        youTubeVideoId: "ZUESwBuuePY",
        localVideoUrl: getLocalVideoUrl("grover_damaged"),
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      grover_repaired: {
        vimeoVideoId: 914609399,
        youTubeVideoId: "bwjOIaBQhEw",
        localVideoUrl: getLocalVideoUrl("grover_repaired"),
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      midgame: {
        vimeoVideoId: 878140313,
        youTubeVideoId: "TUl2pIq0vjA",
        localVideoUrl: getLocalVideoUrl("midgame_cutscene"),
        navigateOnEnd: () => {
          navigateToHub();
        },
      },
      end: {
        vimeoVideoId: 878140421,
        youTubeVideoId: "ELexFB0FQys",
        localVideoUrl: getLocalVideoUrl("final_cutscene"),
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
