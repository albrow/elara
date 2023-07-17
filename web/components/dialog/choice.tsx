import { Box, Button } from "@chakra-ui/react";
import { useCallback } from "react";
import { MdCheck, MdOutlineExitToApp } from "react-icons/md";
import { DialogChoice } from "../../lib/dialog_trees";

export interface ChoiceProps {
  choice: DialogChoice;
  alreadyChosen: boolean;
  onSelection: (selectedChoice: DialogChoice) => void;
}

export default function Choice(props: ChoiceProps) {
  const getIcons = useCallback(() => {
    if (props.alreadyChosen) {
      return (
        <Box color="gray.600">
          <MdCheck
            size="1.1em"
            style={{
              marginLeft: "0.3rem",
              display: "inline",
              marginTop: "-0.1rem",
              verticalAlign: "middle",
            }}
          />
        </Box>
      );
    }
    if (props.choice.nextId == null) {
      // This choice will end the dialog.
      return (
        <Box>
          <MdOutlineExitToApp
            size="1.1em"
            style={{
              marginLeft: "0.3rem",
              display: "inline",
              marginTop: "-0.1rem",
              verticalAlign: "middle",
            }}
          />
        </Box>
      );
    }
    return null;
  }, [props.alreadyChosen, props.choice.nextId]);

  return (
    <Button
      bg={props.alreadyChosen ? "gray.400" : "gray.200"}
      _hover={{ bg: "gray.300", color: "black" }}
      ml="5px"
      mt="5px"
      key={props.choice.text}
      fontSize="1.1rem"
      onClick={() => props.onSelection(props.choice)}
      shadow="lg"
      borderColor="gray.400"
      borderWidth="1px"
      color={props.alreadyChosen ? "gray.600" : "black"}
    >
      {props.choice.text}
      {getIcons()}
    </Button>
  );
}
