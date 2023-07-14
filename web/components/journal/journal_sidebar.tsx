import { useRouter } from "react-router5";
import { Box } from "@chakra-ui/react";
import { useJournalPages } from "../../hooks/scenes_hooks";
import SectionLink from "./section_link";

export interface JournalSidebarProps {}

export default function JournalSidebar() {
  const JOURNAL_PAGES = useJournalPages();
  const router = useRouter();

  return (
    <>
      {JOURNAL_PAGES.map((scene) => (
        <Box key={scene.name} mb="4px">
          <SectionLink
            scene={scene}
            key={router.buildPath(scene.routeName, scene.routeParams)}
          />
        </Box>
      ))}
    </>
  );
}
