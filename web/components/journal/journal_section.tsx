import { Button, Flex, Box } from "@chakra-ui/react";
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

  const shouldShowNextButton = useMemo(() => {
    // Show the "next" button if the next journal page is unlocked
    // or if the next scene is a journal page (meaning it would be
    // unlocked right after we're done viewing this page).
    if (nextJournalPage?.unlocked) {
      return true;
    }
    if (currScene?.nextScene?.type === "journal") {
      return true;
    }

    return false;
  }, [currScene?.nextScene?.type, nextJournalPage?.unlocked]);

  return (
    <>
      <Box className="md-content">
        <SectionComponent />
      </Box>
      <Flex alignItems="right" justifyContent="right" width="100%">
        <Button
          // fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
          // size={BUTTON_RESPONSIVE_SCALE}
          colorScheme="teal"
          onClick={navigateToHub}
        >
          Back to Hub
          <MdHome size="1.3em" style={{ marginLeft: "0.2rem" }} />
        </Button>
        {shouldShowNextButton && (
          <Button
            // fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
            // size={BUTTON_RESPONSIVE_SCALE}
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
