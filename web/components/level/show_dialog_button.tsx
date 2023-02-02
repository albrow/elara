import { Button, Tooltip } from "@chakra-ui/react";
import { MdMessage } from "react-icons/md";

export interface ShowDialogButtonProps {
  onClick: () => void;
}

export default function ShowDialogButton(props: ShowDialogButtonProps) {
  return (
    <Tooltip hasArrow label="Show dialog" placement="right">
      <Button
        bg="blue.500"
        _hover={{ bg: "blue.600" }}
        _active={{ bg: "blue.700" }}
        borderRadius="50%"
        w="40px"
        h="40px"
        p="0"
        onClick={props.onClick}
      >
        <MdMessage size="16px" color="white" />
      </Button>
    </Tooltip>
  );
}
