import { useMemo } from "react";
import FullscreenVideo from "../components/fullscreen_video";
import { useSceneNavigator } from "../hooks/scenes_hooks";

export interface CutsceneProps {
  cutsceneId: "intro" | "midgame" | "end";
}

export default function Cutscene(props: CutsceneProps) {
  const { navigateToHub } = useSceneNavigator();

  const videoId = useMemo(() => {
    if (props.cutsceneId === "intro") return 862764545;
    throw new Error(`Unknown cutscene: ${props.cutsceneId}`);
  }, [props.cutsceneId]);

  const onEnd = useMemo(() => {
    if (props.cutsceneId === "intro") return () => navigateToHub();
    throw new Error(`Unknown cutscene: ${props.cutsceneId}`);
  }, [navigateToHub, props.cutsceneId]);

  return <FullscreenVideo videoId={videoId} onEnd={onEnd} />;
}
