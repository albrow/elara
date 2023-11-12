import { Button, Tooltip } from "@chakra-ui/react";
import { MdMessage } from "react-icons/md";

export interface ShowDialogButtonProps {
  onClick: () => void;
}

export default function ShowDialogButton(props: ShowDialogButtonProps) {
  return (
    <Tooltip label="Show dialog" placement="right">
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
        <MdMessage size="16px" color="white" />
      </Button>
    </Tooltip>
  );
}
