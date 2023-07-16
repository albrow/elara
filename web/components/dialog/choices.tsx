import { Button } from "@chakra-ui/react";
import { DialogChoice } from "../../lib/dialog_trees";

export interface ChoicesProps {
  choices: DialogChoice[];
  onSelection: (selectedChoice: DialogChoice) => void;
}

export default function Choices(props: ChoicesProps) {
  return (
    <>
      {props.choices.map((choice) => (
        <Button
          bg="gray.200"
          _hover={{ bg: "gray.300" }}
          ml="5px"
          mt="5px"
          key={choice.text}
          fontSize="1.1rem"
          onClick={() => props.onSelection(choice)}
          shadow="lg"
          borderColor="gray.400"
          borderWidth="1px"
        >
          {choice.text}
        </Button>
      ))}
    </>
  );
}
