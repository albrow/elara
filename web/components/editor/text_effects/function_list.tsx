import { Menu, MenuButton, MenuList, Tooltip } from "@chakra-ui/react";
import { BsJournalCode as JournalIcon } from "react-icons/bs";
import { useMemo } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import {
  BP_XL,
  FUNCTION_LIST_RESPONSIVE_WIDTH,
} from "../../../lib/responsive_design";
import FunctionListItem from "./function_list_item";

export interface FunctionListProps {
  funcNames: string[];
}

export default function FunctionList(props: FunctionListProps) {
  const windowSize = useWindowSize();

  const journalIconSize = useMemo(() => {
    // if (windowWidth >= BP_3XL) {
    //   return "1.6em";
    // }
    // if (windowWidth >= BP_2XL) {
    //   return "1.4em";
    // }
    if (windowSize.width && windowSize.width >= BP_XL) {
      return "1.2em";
    }
    return "1em";
  }, [windowSize]);

  return (
    <Menu placement="bottom-end" closeOnSelect={false} closeOnBlur>
      {/* Larger button */}

      <Tooltip
        // fontSize={BODY_RESPONSIVE_FONT_SCALE}
        label="Function list"
      >
        <MenuButton
          rounded={{ base: "3px", xl: "md" }}
          _hover={{ background: "gray.700" }}
          color="white"
          p={{ base: "4px", xl: "6px" }}
          px={{ base: "8px", xl: "9px" }}
        >
          <JournalIcon size={journalIconSize} />
        </MenuButton>
      </Tooltip>

      <MenuList
        background="gray.700"
        borderColor="black"
        shadow="dark-lg"
        w={FUNCTION_LIST_RESPONSIVE_WIDTH}
        maxW={FUNCTION_LIST_RESPONSIVE_WIDTH}
        minW={FUNCTION_LIST_RESPONSIVE_WIDTH}
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
