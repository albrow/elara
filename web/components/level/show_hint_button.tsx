import { Button, Tooltip } from "@chakra-ui/react";
import { FaLightbulb } from "react-icons/fa";

export interface ShowHintButtonProps {
  onClick: () => void;
}

export default function ShowHintButton(props: ShowHintButtonProps) {
  return (
    <Tooltip label="Show hint(s)" placement="right">
      <Button
        bg="blue.500"
        _hover={{ bg: "blue.600" }}
        _active={{ bg: "blue.700" }}
        borderRadius="100%"
        minW="none"
        w="32px"
        h="32px"
        p="0"
        onClick={props.onClick}
      >
        <FaLightbulb size="16px" color="white" />
      </Button>
    </Tooltip>
  );
}
