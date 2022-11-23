import { Link, useParams } from "react-router-dom";
import { Container, Flex, Button, Text, Box } from "@chakra-ui/react";

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

  return (
    <Box bg="gray.300">
      <Container maxW="container.xl">
        <Flex direction="row">
          <Box
            flexGrow={1}
            flexShrink={0}
            p={8}
            pr={4}
            textAlign="right"
            minH="calc(100vh - 56px)"
          >
            {Object.keys(sections).map((linkName) => (
              <div key={linkName}>
                <Link to={`/journal/concepts/${linkName}`}>
                  <Button
                    size="xs"
                    fontSize="sm"
                    variant="ghost"
                    colorScheme="blackAlpha"
                    mt={1}
                    isActive={sectionName == linkName}
                  >
                    {linkName}
                  </Button>
                </Link>
              </div>
            ))}
          </Box>
          <Box bg="white" p={8} minH="">
            <JournalSection section={sectionName as SectionName} />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
