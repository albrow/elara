import { Button } from "@chakra-ui/react";
import * as React from "react";

export interface NavbarButtonProps {
  onClick: () => void;
}

const NAVBAR_BUTTON_RESPONSIVE_HEIGHT = {
  base: 10,
  // "2xl": 12,
  // "3xl": 14,
};

const NAVBAR_BUTTON_RESPONSIVE_FONT_SIZE = {
  base: "16px",
  // "2xl": '20px',
  // "3xl": '24px',
};

const NAVBAR_BUTTON_RESPONSIVE_PADDING_X = {
  base: 4,
  // "2xl": 5,
  // "3xl": 6,
};

export default function NavbarButton(
  props: React.PropsWithChildren<NavbarButtonProps>
) {
  return (
    <Button
      height={NAVBAR_BUTTON_RESPONSIVE_HEIGHT}
      fontSize={NAVBAR_BUTTON_RESPONSIVE_FONT_SIZE}
      px={NAVBAR_BUTTON_RESPONSIVE_PADDING_X}
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
