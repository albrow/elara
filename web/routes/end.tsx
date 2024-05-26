import { Container } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouteNode } from "react-router5";

import EndContent from "../components/end.mdx";
import "../styles/md_content.css";
import { getChallengeProgress } from "../lib/utils";
import { useSaveData } from "../hooks/save_data_hooks";
// eslint-disable-next-line camelcase
import { get_level_data } from "../../elara-lib/pkg/elara_lib";
import { NAVBAR_RESPONSIVE_HEIGHT } from "../lib/responsive_design";

export default function End() {
  const { route } = useRouteNode("");
  const [saveData] = useSaveData();
  const levelData = new Map(Object.entries(get_level_data()));
  const challengeProgress = getChallengeProgress(levelData, saveData);

  useEffect(() => {
    document.title = "Elara | End";
  }, [route.name]);

  return (
    <Container maxW="container.xl" p={8} mt={NAVBAR_RESPONSIVE_HEIGHT}>
      <div className="md-content">
        <EndContent challengeProgress={challengeProgress} />
      </div>
    </Container>
  );
}
