import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Container, Flex, Box } from "@chakra-ui/react";
import { useSaveData } from "../contexts/save_data";

import JournalSection, {
  sections,
  SectionName,
} from "../components/journal/journal_section";
import { TREES } from "../lib/dialog_trees";
import DialogModal from "../components/dialog/dialog_modal";
import ShowDialogButton from "../components/level/show_dialog_button";

export default function Journal() {
  let { sectionName } = useParams();
  const [saveData, _] = useSaveData();

  // Default to the first section.
  sectionName ||= Object.keys(sections)[0] as SectionName;
  if (sectionName !== undefined && !(sectionName in sections)) {
    throw new Error(`Unknown section: ${sectionName}`);
  }

  const dialogTreeName = `journal_${sectionName}`;

  useEffect(() => {
    if (sectionName) {
      document.title = `Elara | Journal: ${sectionName}`;
    } else {
      document.title = "Elara | Journal";
    }
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
        {!dialogVisible && getDialogTree() !== null && (
          // TODO(albrow): This is sort of a hack to get the button to show up in
          // the right place. Consider changing later.
          <Box position="relative" top="-82px" left="25px" w="500px">
            <ShowDialogButton onClick={() => setDialogVisible(true)} />
          </Box>
        )}
      </Container>
    </Box>
  );
}
