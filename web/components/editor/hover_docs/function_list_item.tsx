import { Box, MenuItem, Text } from "@chakra-ui/react";
import { useState } from "react";

import { FUNCTION_LIST_WIDTH } from "./function_list";
import { docPages, HoverWord } from ".";

export interface FunctionListItemProps {
  funcName: string;
}

export default function FunctionListItem(props: FunctionListItemProps) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const Page = docPages[props.funcName as HoverWord];

  if (Page === undefined) {
    throw new Error(`No documentation page for ${props.funcName}`);
  }

  return (
    <MenuItem
      background="gray.700"
      color="white"
      _hover={{ background: "gray.600" }}
      onMouseEnter={() => {
        setIsActive(true);
      }}
      onMouseLeave={() => {
        setIsActive(false);
      }}
    >
      <Text fontFamily="monospace">{props.funcName}</Text>
      {isActive && (
        <Box position="relative" width="100%">
          <Box
            userSelect="text"
            bg="gray.200"
            position="absolute"
            top="-20px"
            right={`${FUNCTION_LIST_WIDTH - 14}px`}
            shadow="dark-lg"
            onKeyDown={() => {}}
          >
            <Box
              className="md-content hover-doc"
              bg="gray.200"
              py="2px"
              px="12px"
              border="1px"
              borderColor="gray.500"
              width="350px"
              color="black"
              userSelect="text"
              _hover={{ cursor: "text" }}
            >
              <Page />
            </Box>
          </Box>
        </Box>
      )}
    </MenuItem>
  );
}
