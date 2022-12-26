import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { Container, Flex, Box } from "@chakra-ui/react";

import JournalSection, {
  sections,
  SectionName,
} from "../components/journal/journal_section";

export default function Journal() {
  let { sectionName } = useParams();

  // Default to the first section.
  sectionName ||= Object.keys(sections)[0] as SectionName;
  if (sectionName !== undefined && !(sectionName in sections)) {
    throw new Error(`Unknown section: ${sectionName}`);
  }

  useEffect(() => {
    if (sectionName) {
      document.title = `Elara | Journal: ${sectionName}`;
    } else {
      document.title = "Elara | Journal";
    }
  }, [sectionName]);

  return (
    <Box>
      <Container maxW="container.xl">
        <Flex direction="row">
          <Box bg="white" p={8} minH="">
            <JournalSection section={sectionName as SectionName} />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
