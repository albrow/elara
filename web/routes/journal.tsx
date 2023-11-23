import { useRouteNode, useRouter } from "react-router5";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Unsubscribe } from "router5/dist/types/base";

import { useSaveData } from "../hooks/save_data_hooks";
import { JOURNAL_SECTIONS, SectionName } from "../components/journal/sections";
import JournalSection from "../components/journal/journal_section";
import { TREES } from "../lib/dialog_trees";
import JournalSidebar from "../components/journal/journal_sidebar";
import { NAVBAR_HEIGHT } from "../lib/constants";
import { useDialogModal } from "../hooks/dialog_modal_hooks";

import journalBgImage from "../images/journal_bg_only.jpg";

export default function Journal() {
  const { route } = useRouteNode("");
  const router = useRouter();
  const [saveData, { markJournalPageSeen }] = useSaveData();
  const [showDialogModal] = useDialogModal();
  const journalScrollbox = useRef<HTMLDivElement>(null);

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
    if (journalScrollbox.current) {
      journalScrollbox.current.scrollTo(0, 0);
    } else {
      console.warn("journalScrollbox.current is null");
    }
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
      bgImage={`url("${journalBgImage}")`}
      bgRepeat="no-repeat"
      bgSize="cover"
      w="100%"
      h="100%"
      position="fixed"
      pt={{ base: "10px", xl: "16px", "2xl": "32px" }}
      pb={{ base: "0px", xl: "8px", "2xl": "16px" }}
      overflowX="scroll"
    >
      <Flex
        mx="auto"
        w="fit-content"
        maxW="100%"
        h="100%"
        minH="500px"
        minW="600px"
      >
        {/* Left handle */}
        <Box
          w="60px"
          bg="#202E29"
          h="30%"
          maxH="300px"
          minH="200px"
          mt="33vh"
          borderLeftRadius="20px"
          border="1px solid black"
          borderRight="none"
          boxShadow="0 5px 12px 5px rgba(0, 0, 0, 0.5)"
        />
        {/* Main journal body */}
        <Box
          bg="gray.300"
          border="16px solid #758DA1"
          borderRadius="5px"
          w="100%"
          maxW="container.2xl"
          h={`calc(100% - ${NAVBAR_HEIGHT}px)`}
          boxShadow="0 5px 12px 5px rgba(0, 0, 0, 0.5)"
        >
          <Flex h="100%">
            <Box h="100%" w="fit-content">
              <JournalSidebar />
            </Box>
            <Box
              ref={journalScrollbox}
              bg="white"
              p="20px"
              border="1px solid"
              borderTop="none"
              borderBottom="none"
              borderColor="gray.400"
              h="100%"
              overflowY="auto"
              className="dark-scrollbar"
            >
              <JournalSection section={sectionName as SectionName} />
            </Box>
          </Flex>
        </Box>
        {/* Right handle */}
        <Box
          w="60px"
          bg="#202E29"
          h="30%"
          maxH="300px"
          mt="33vh"
          borderRightRadius="20px"
          border="1px solid black"
          borderLeft="none"
          boxShadow="0 5px 12px 5px rgba(0, 0, 0, 0.5)"
        />
      </Flex>
    </Box>
  );
}
