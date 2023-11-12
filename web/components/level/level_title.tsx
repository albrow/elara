import { Text, Tooltip, Box } from "@chakra-ui/react";
import { useState } from "react";
import { RxDropdownMenu } from "react-icons/rx";
import { useLevelSelectModal } from "../../hooks/level_select_modal_hooks";

export interface LevelTitleProps {
  title: string;
  levelIndex: number;
}

export default function LevelTitle(props: LevelTitleProps) {
  const [hoveringOver, setHoveringOver] = useState<boolean>(false);
  const [showLevelSelectModal] = useLevelSelectModal();

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
          size="1.4em"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "0.5em",
          }}
        />
        <Text
          fontSize="1.4em"
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
