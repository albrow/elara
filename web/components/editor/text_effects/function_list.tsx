import { Menu, MenuButton, MenuList, Tooltip, Box } from "@chakra-ui/react";
import { BsJournalCode } from "react-icons/bs";

import { FUNCTION_LIST_WIDTH } from "../../../lib/constants";
import FunctionListItem from "./function_list_item";

export interface FunctionListProps {
  funcNames: string[];
}

export default function FunctionList(props: FunctionListProps) {
  return (
    <Menu placement="bottom-end" closeOnSelect={false} closeOnBlur>
      {/* Larger button */}

      <Tooltip label="Function list">
        <MenuButton
          rounded={{ base: "3px", xl: "md" }}
          _hover={{ background: "gray.700" }}
          color="white"
          p={{ base: "4px", xl: "6px" }}
          px={{ base: "8px", xl: "9px" }}
        >
          <Box display={{ base: "none", xl: "inline" }}>
            <BsJournalCode size="1.2em" />
          </Box>
          <Box display={{ base: "inline", xl: "none" }}>
            <BsJournalCode size="1.0em" />
          </Box>
        </MenuButton>
      </Tooltip>

      <MenuList
        background="gray.700"
        borderColor="black"
        shadow="dark-lg"
        w={`${FUNCTION_LIST_WIDTH}px`}
        maxW={`${FUNCTION_LIST_WIDTH}px`}
        minW={`${FUNCTION_LIST_WIDTH}px`}
        onKeyDown={(e) => {
          // Workaround to re-enable the cmd+c and ctrl+c shortcuts.
          // TODO(albrow): Since the execCommand method is deprecated, we
          // will eventually need a different way to do this. Maybe implementing
          // our own menu component?
          if ((e.ctrlKey || e.metaKey) && e.key === "c") {
            document.execCommand("copy");
          }
        }}
      >
        {props.funcNames.map((funcName) => (
          <FunctionListItem key={funcName} funcName={funcName} />
        ))}
      </MenuList>
    </Menu>
  );
}
