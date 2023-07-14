import { Button, Flex } from "@chakra-ui/react";
import { MdArrowForward, MdHome } from "react-icons/md";
import { useMemo } from "react";

import { useCurrScene, useSceneNavigator } from "../../hooks/scenes_hooks";
import "../../styles/md_content.css";
import { getNextJournalPage } from "../../lib/utils";
import { JOURNAL_SECTIONS, SectionName } from "./sections";

export interface JournalProps {
  section: SectionName;
}

export default function JournalSection(props: JournalProps) {
  const SectionComponent = JOURNAL_SECTIONS[props.section];
  const { navigateToScene, navigateToHub } = useSceneNavigator();
  const currScene = useCurrScene();
  const nextJournalPage = useMemo(
    () => getNextJournalPage(currScene!),
    [currScene]
  );

  return (
    <>
      <div className="md-content">
        <SectionComponent />
      </div>
      <Flex alignItems="right" justifyContent="right" width="100%">
        <Button colorScheme="teal" onClick={navigateToHub}>
          Back to Hub
          <MdHome size="1.3em" style={{ marginLeft: "0.2rem" }} />
        </Button>
        {nextJournalPage?.unlocked && (
          <Button
            colorScheme="blue"
            onClick={() => navigateToScene(nextJournalPage!)}
            ml="5px"
          >
            Next Page
            <MdArrowForward size="1.3em" style={{ marginLeft: "0.2rem" }} />
          </Button>
        )}
      </Flex>
    </>
  );
}
