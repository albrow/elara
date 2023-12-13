import { useRouter } from "react-router5";
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { MdMenu } from "react-icons/md";

import { useJournalPages } from "../../hooks/scenes_hooks";
import SectionLink from "./section_link";

export interface JournalSidebarProps {}

export default function JournalSidebar() {
  const JOURNAL_PAGES = useJournalPages();
  const router = useRouter();

  return (
    <>
      <Box display={{ xl: "block", base: "none" }} p="8px" mt="5px">
        {JOURNAL_PAGES.map((scene) => (
          <Box key={scene.name} mb="4px">
            <SectionLink
              scene={scene}
              key={router.buildPath(scene.routeName, scene.routeParams)}
            />
          </Box>
        ))}
      </Box>
      <Box display={{ xl: "none", base: "block" }} p="8px" mt="5px">
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<MdMenu size="1.5em" />}
            variant="ghost"
          />

          <MenuList
            minW="fit-content"
            border="1px solid"
            borderColor="gray.400"
            p="8px"
            bg="gray.200"
            borderRadius="0"
            boxShadow="0 5px 12px 0px rgba(0, 0, 0, 0.5)"
          >
            <Box>
              {JOURNAL_PAGES.map((scene) => (
                <MenuItem bg="gray.200" p="0" key={scene.name} as="div">
                  <Box mb="4px">
                    <SectionLink scene={scene} />
                  </Box>
                </MenuItem>
              ))}
            </Box>
          </MenuList>
        </Menu>
      </Box>
    </>
  );
}
