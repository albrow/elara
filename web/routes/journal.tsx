import { useRouteNode } from "react-router5";
import { useCallback, useEffect, useState } from "react";
import { Container, Flex, Box } from "@chakra-ui/react";

import { useSaveData } from "../hooks/save_data_hooks";
import { JOURNAL_SECTIONS, SectionName } from "../components/journal/sections";
import JournalSection from "../components/journal/journal_section";
import { TREES } from "../lib/dialog_trees";
import DialogModal from "../components/dialog/dialog_modal";

export default function Journal() {
  const { route } = useRouteNode("");
  let { sectionName } = route.params as { sectionName?: SectionName };
  const [saveData, _] = useSaveData();

  // Default to the first section.
  sectionName ||= Object.keys(JOURNAL_SECTIONS)[0] as SectionName;
  if (sectionName !== undefined && !(sectionName in JOURNAL_SECTIONS)) {
    throw new Error(`Unknown section: ${sectionName}`);
  }

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
    <Box>
      <Container maxW="container.xl">
        <DialogModal
          visible={dialogVisible}
          setVisible={setDialogVisible}
          treeName={getDialogTree()}
        />
        <Flex direction="row">
          <Box bg="white" p={8} minH="">
            <JournalSection section={sectionName as SectionName} />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
