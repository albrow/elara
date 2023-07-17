import { DialogChoice } from "../../lib/dialog_trees";
import Choice from "./choice";

export interface ChoicesProps {
  choices: DialogChoice[];
  chosenChoices: string[];
  onSelection: (selectedChoice: DialogChoice) => void;
}

export default function Choices(props: ChoicesProps) {
  return (
    <>
      {props.choices.map((choice) => (
        <Choice
          key={choice.text}
          choice={choice}
          alreadyChosen={props.chosenChoices.includes(choice.text)}
          onSelection={props.onSelection}
        />
      ))}
    </>
  );
}
