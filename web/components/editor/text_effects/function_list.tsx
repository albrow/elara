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
      <Box display={{ base: "none", xl: "block" }}>
        <Tooltip label="Function list">
          <MenuButton
            rounded="md"
            _hover={{ background: "gray.700" }}
            color="white"
            p="6px"
            px="9px"
          >
            <BsJournalCode size="1.2em" />
          </MenuButton>
        </Tooltip>
      </Box>
      {/* Smaller button */}
      <Box display={{ base: "block", xl: "none" }}>
        <Tooltip label="Function list">
          <MenuButton
            rounded="3px"
            _hover={{ background: "gray.700" }}
            color="white"
            p="4px"
            px="8px"
            m="0"
          >
            <BsJournalCode size="1.0em" />
          </MenuButton>
        </Tooltip>
      </Box>

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
