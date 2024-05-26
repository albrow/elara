import { Button, Tooltip } from "@chakra-ui/react";
import { FaLightbulb } from "react-icons/fa";
import { useMemo } from "react";
import { useWindowWidth } from "../../hooks/responsive_hooks";
import { BP_2XL, BP_3XL, BP_XL, LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_2XL, LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_3XL, LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_BASE, LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_XL } from "../../lib/constants";

const buttonSize = {
  base: `${LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_BASE * 2}px`,
  xl: `${LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_XL * 2}px`,
  "2xl": `${LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_2XL * 2}px`,
  "3xl": `${LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_3XL * 2}px`,
};

export interface ShowHintButtonProps {
  onClick: () => void;
}

export default function ShowHintButton(props: ShowHintButtonProps) {
  const windowWidth = useWindowWidth();

  const lightbulbSize = useMemo(() => {
    if (windowWidth >= BP_3XL) {
      return `${LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_3XL}px`;
    }
    if (windowWidth >= BP_2XL) {
      return `${LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_2XL}px`;
    }
    if (windowWidth >= BP_XL) {
      return `${LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_XL}px`;
    }
    return `${LEVEL_TITLE_HINT_BUTTON_LIGHTBULB_SIZE_BASE}px`;
  }, [windowWidth]);

  return (
    <Tooltip label="Show hint(s)" placement="right">
      <Button
        bg="blue.500"
        _hover={{ bg: "blue.600" }}
        _active={{ bg: "blue.700" }}
        borderRadius="100%"
        minW="none"
        w={buttonSize}
        h={buttonSize}
        p="0"
        onClick={props.onClick}
      >
        <FaLightbulb size={lightbulbSize} color="white" />
      </Button>
    </Tooltip>
  );
}
