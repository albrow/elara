import { Text, Tooltip, Box } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { RxDropdownMenu } from "react-icons/rx";
import { useLevelSelectModal } from "../../hooks/level_select_modal_hooks";
import { useWindowWidth } from "../../hooks/responsive_hooks";
import { BP_2XL, BP_3XL, BP_XL, LEVEL_TITLE_FONT_SIZE_2XL, LEVEL_TITLE_FONT_SIZE_3XL, LEVEL_TITLE_FONT_SIZE_BASE, LEVEL_TITLE_FONT_SIZE_XL } from "../../lib/constants";

export interface LevelTitleProps {
  title: string;
  levelIndex: number;
}

export default function LevelTitle(props: LevelTitleProps) {
  const [hoveringOver, setHoveringOver] = useState<boolean>(false);
  const [showLevelSelectModal] = useLevelSelectModal();
  // Note: We have to use JavaScript to control the size of the dropdown menu icon because
  // React Icons requires you to pass in the size as a string.
  const windowWidth = useWindowWidth();

  const dropdownMenuSize = useMemo(() => {
    if (windowWidth >= BP_3XL) {
      return LEVEL_TITLE_FONT_SIZE_3XL;
    }
    if (windowWidth >= BP_2XL) {
      return LEVEL_TITLE_FONT_SIZE_2XL;
    }
    if (windowWidth >= BP_XL) {
      return LEVEL_TITLE_FONT_SIZE_XL;
    }
    return LEVEL_TITLE_FONT_SIZE_BASE;
  }, [windowWidth]);

  return (
    <Tooltip label="Select a different level" placement="right">
      <Box
        _hover={{ cursor: "pointer" }}
        onMouseEnter={() => setHoveringOver(true)}
        onMouseLeave={() => setHoveringOver(false)}
        border="1px solid"
        borderColor={hoveringOver ? "gray.500" : "transparent"}
        bg={hoveringOver ? "gray.200" : "transparent"}
        borderRadius="md"
        px="8px"
        py="2px"
        onClick={() => showLevelSelectModal()}
      >
        <RxDropdownMenu
          size={dropdownMenuSize}
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "0.5em",
          }}
        />
        <Text
          fontSize={{
            base: LEVEL_TITLE_FONT_SIZE_BASE,
            xl: LEVEL_TITLE_FONT_SIZE_XL,
            "2xl": LEVEL_TITLE_FONT_SIZE_2XL,
            "3xl": LEVEL_TITLE_FONT_SIZE_3XL,
          }}
          fontWeight="bold"
          as="span"
          verticalAlign="middle"
        >
          Level {props.levelIndex}: {props.title}
        </Text>
      </Box>
    </Tooltip>
  );
}
