import { useRouteNode, useRouter } from "react-router5";
import { useCallback, useEffect, useState } from "react";
import { Container, Flex, Box } from "@chakra-ui/react";
import { Unsubscribe } from "router5/dist/types/base";

import { useSaveData } from "../hooks/save_data_hooks";
import { JOURNAL_SECTIONS, SectionName } from "../components/journal/sections";
import JournalSection from "../components/journal/journal_section";
import { TREES } from "../lib/dialog_trees";
import DialogModal from "../components/dialog/dialog_modal";
import JournalSidebar from "../components/journal/journal_sidebar";
import { NAVBAR_HEIGHT } from "../lib/constants";

export default function Journal() {
  const { route } = useRouteNode("");
  const router = useRouter();

  let { sectionName } = route.params as { sectionName?: SectionName };
  const [saveData, { markJournalPageSeen }] = useSaveData();

  // Default to the first section.
  sectionName ||= Object.keys(JOURNAL_SECTIONS)[0] as SectionName;
  if (!(sectionName in JOURNAL_SECTIONS)) {
    throw new Error(`Unknown section: ${sectionName}`);
  }

  // Mark the journal page as seen as soon as we navigate away from it.
  useEffect(() => {
    const unsubscribe = router.subscribe((_transition) => {
      markJournalPageSeen(sectionName!);
    }) as Unsubscribe;
    return unsubscribe;
  }, [markJournalPageSeen, router, sectionName]);

  const dialogTreeName = `journal_${sectionName}`;

  useEffect(() => {
    if (sectionName) {
      document.title = `Elara | Journal: ${sectionName}`;
    } else {
      document.title = "Elara | Journal";
    }
    // Scroll to the top of the page when loading a new
    // journal section.
    window.scrollTo(0, 0);
  }, [sectionName]);

  const getDialogTree = useCallback(() => {
    if (!(dialogTreeName in TREES)) {
      // There is no dialog tree for this level.
      return null;
    }
    return dialogTreeName;
  }, [dialogTreeName]);

  const shouldShowDialogTree = useCallback(
    () =>
      getDialogTree() !== null &&
      !saveData.seenDialogTrees.includes(dialogTreeName),
    [dialogTreeName, getDialogTree, saveData.seenDialogTrees]
  );

  const [dialogVisible, setDialogVisible] = useState(shouldShowDialogTree());

  return (
    <Box
      mt={`${NAVBAR_HEIGHT}px`}
      id="dark-bg"
      bg="black"
      w="100%"
      minH={`calc(100vh - ${NAVBAR_HEIGHT}px)`}
      py="20px"
    >
      <Container maxW="container.xl">
        <DialogModal
          visible={dialogVisible}
          setVisible={setDialogVisible}
          treeName={getDialogTree()}
        />
        <Box bg="gray.300" p="10px" borderRadius="5px" pl="5px">
          <Flex>
            <Box h="100%" w="200px" mr="5px">
              <JournalSidebar />
            </Box>
            <Box
              bg="white"
              p="20px"
              borderRadius="5px"
              border="1px solid"
              borderColor="gray.400"
            >
              <JournalSection section={sectionName as SectionName} />
            </Box>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
