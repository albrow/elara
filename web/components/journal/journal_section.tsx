import { Button, Flex } from "@chakra-ui/react";
import { MdArrowForward, MdHome } from "react-icons/md";

import { useCurrScene, useSceneNavigator } from "../../hooks/scenes_hooks";
import "../../styles/md_content.css";
import { JOURNAL_SECTIONS, SectionName } from "./sections";

export interface JournalProps {
  section: SectionName;
}

export default function JournalSection(props: JournalProps) {
  const SectionComponent = JOURNAL_SECTIONS[props.section];
  const { navigateToNextScene, navigateToHub } = useSceneNavigator();
  const currScene = useCurrScene();

  return (
    <>
      <div className="md-content">
        <SectionComponent />
      </div>
      <Flex alignItems="right" justifyContent="right" width="100%">
        {currScene?.nextScene?.type === "journal" && (
          <Button colorScheme="blue" onClick={navigateToNextScene}>
            Next
            <MdArrowForward size="1.3em" style={{ marginLeft: "0.2rem" }} />
          </Button>
        )}
        {currScene?.nextScene?.type !== "journal" && (
          <Button colorScheme="blue" onClick={navigateToHub}>
            Back to Hub
            <MdHome size="1.3em" style={{ marginLeft: "0.2rem" }} />
          </Button>
        )}
      </Flex>
    </>
  );
}
