import { useRouteNode, useRouter } from "react-router5";
import { useCallback, useEffect, useMemo } from "react";
import { Container, Flex, Box } from "@chakra-ui/react";
import { Unsubscribe } from "router5/dist/types/base";

import { useSaveData } from "../hooks/save_data_hooks";
import { JOURNAL_SECTIONS, SectionName } from "../components/journal/sections";
import JournalSection from "../components/journal/journal_section";
import { TREES } from "../lib/dialog_trees";
import JournalSidebar from "../components/journal/journal_sidebar";
import { NAVBAR_HEIGHT } from "../lib/constants";
import { useDialogModal } from "../hooks/dialog_modal_hooks";

export default function Journal() {
  const { route } = useRouteNode("");
  const router = useRouter();
  const [saveData, { markJournalPageSeen }] = useSaveData();
  const [showDialogModal] = useDialogModal();

  const sectionName = useMemo(() => {
    let name = route.params?.sectionName;
    // Default to the first section.
    name ||= Object.keys(JOURNAL_SECTIONS)[0] as SectionName;
    if (!(name in JOURNAL_SECTIONS)) {
      throw new Error(`Unknown section: ${name}`);
    }
    return name;
  }, [route.params?.sectionName]);

  // Mark the journal page as seen as soon as we navigate away from it.
  useEffect(() => {
    const unsubscribe = router.subscribe((_transition) => {
      markJournalPageSeen(sectionName!);
    }) as Unsubscribe;
    return unsubscribe;
  }, [markJournalPageSeen, router, sectionName]);

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

  const dialogTreeName = useMemo(() => {
    const name = `journal_${sectionName}`;
    if (!(name in TREES)) {
      // There is no dialog tree for this level.
      return null;
    }
    return name;
  }, [sectionName]);

  const shouldShowDialogTree = useCallback(
    () =>
      dialogTreeName !== null &&
      !saveData.seenDialogTrees.includes(dialogTreeName),
    [dialogTreeName, saveData.seenDialogTrees]
  );

  useEffect(() => {
    if (shouldShowDialogTree() && dialogTreeName != null) {
      showDialogModal(dialogTreeName);
    }
  });

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
