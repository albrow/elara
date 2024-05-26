import { Box, MenuItem, Text } from "@chakra-ui/react";
import { useState } from "react";

import { BODY_RESPONSIVE_FONT_SCALE, FUNCTION_LIST_ITEM_HOVER_RESPONSIVE_RIGHT, FUNCTION_LIST_ITEM_HOVER_RESPONSIVE_TRANSFORM, HOVER_DOC_BOX_SHADOW } from "../../../lib/constants";
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
      <Text fontFamily="monospace" fontSize={BODY_RESPONSIVE_FONT_SCALE}>
        {props.funcName}
      </Text>
      {isActive && (
        <Box position="relative" width="100%">
          <Box
            userSelect="text"
            bg="gray.200"
            position="absolute"
            top="0"
            transform="translateY(calc(-100% + 20px))"
            right={FUNCTION_LIST_ITEM_HOVER_RESPONSIVE_RIGHT}
            onKeyDown={() => { }}
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
              boxShadow={HOVER_DOC_BOX_SHADOW}
              transform={FUNCTION_LIST_ITEM_HOVER_RESPONSIVE_TRANSFORM}
              transformOrigin="right"
            >
              <Page />
            </Box>
          </Box>
        </Box>
      )}
    </MenuItem>
  );
}
