import { Button } from "@chakra-ui/react";
import * as React from "react";

export interface NavbarButtonProps {
  onClick: () => void;
}

export default function NavbarButton(
  props: React.PropsWithChildren<NavbarButtonProps>
) {
  return (
    <Button
      mr="18px"
      background="none"
      fontWeight="bold"
      color="gray.300"
      _hover={{
        background: "var(--chakra-colors-gray-700)",
      }}
      _active={{
        background: "var(--chakra-colors-gray-700)",
      }}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}
