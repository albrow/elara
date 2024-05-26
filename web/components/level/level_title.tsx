import { Text, Tooltip, Box } from "@chakra-ui/react";
import { useState } from "react";
import { RxDropdownMenu } from "react-icons/rx";
import { useLevelSelectModal } from "../../hooks/level_select_modal_hooks";
import { TITLE_FONT_SIZE_BASE } from "../../lib/responsive_design";

export interface LevelTitleProps {
  title: string;
  levelIndex: number;
}

export default function LevelTitle(props: LevelTitleProps) {
  const [hoveringOver, setHoveringOver] = useState<boolean>(false);
  const [showLevelSelectModal] = useLevelSelectModal();
  // Note: We have to use JavaScript to control the size of the dropdown menu icon because
  // React Icons requires you to pass in the size as a string.
  // const windowWidth = useWindowWidth();

  // const dropdownMenuSize = useMemo(() => {
  //   if (windowWidth >= BP_3XL) {
  //     return TITLE_FONT_SIZE_3XL;
  //   }
  //   if (windowWidth >= BP_2XL) {
  //     return TITLE_FONT_SIZE_2XL;
  //   }
  //   if (windowWidth >= BP_XL) {
  //     return TITLE_FONT_SIZE_XL;
  //   }
  //   return TITLE_FONT_SIZE_BASE;
  // }, [windowWidth]);

  return (
    <Tooltip
      // fontSize={BODY_RESPONSIVE_FONT_SCALE}
      label="Select a different level"
      placement="right"
    >
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
          size={TITLE_FONT_SIZE_BASE}
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "0.5em",
          }}
        />
        <Text
          // fontSize={TITLE_RESPONSIVE_FONT_SCALE}
          fontSize={TITLE_FONT_SIZE_BASE}
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
