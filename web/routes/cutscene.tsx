import { useCallback, useMemo } from "react";

import FullscreenVideo from "../components/fullscreen_video";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import { useSaveData } from "../hooks/save_data_hooks";

export interface CutsceneProps {
  cutsceneId: "intro" | "midgame" | "end";
}

export default function Cutscene(props: CutsceneProps) {
  const { navigateToHub } = useSceneNavigator();
  const [_, { markCutsceneSeen }] = useSaveData();

  const videoId = useMemo(() => {
    if (props.cutsceneId === "intro") return 862764545;
    throw new Error(`Unknown cutscene: ${props.cutsceneId}`);
  }, [props.cutsceneId]);

  const navigateToNext = useCallback(() => {
    if (props.cutsceneId === "intro") {
      navigateToHub();
    } else {
      throw new Error(`Unknown cutscene: ${props.cutsceneId}`);
    }
  }, [navigateToHub, props.cutsceneId]);

  const onEnd = useCallback(() => {
    markCutsceneSeen(props.cutsceneId);
    navigateToNext();
  }, [markCutsceneSeen, navigateToNext, props.cutsceneId]);

  return <FullscreenVideo videoId={videoId} onEnd={onEnd} />;
}
