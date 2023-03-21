import { Button, Flex } from "@chakra-ui/react";
import { MdArrowForward } from "react-icons/md";

import { useSceneNavigator } from "../../contexts/scenes";
import Functions from "./sections/functions.mdx";
import FunctionOutputs from "./sections/function_outputs.mdx";
import Comments from "./sections/comments.mdx";
import WhileLoops from "./sections/while_loops.mdx";
import Variables from "./sections/variables.mdx";
import Arrays from "./sections/arrays.mdx";
import Comparisons from "./sections/comparisons.mdx";
import IfStatements from "./sections/if_statements.mdx";
import Loops from "./sections/loops.mdx";
import Strings from "./sections/strings.mdx";
import CreatingFunctions from "./sections/creating_functions.mdx";
import ChangingArrays from "./sections/changing_arrays.mdx";
import "../../styles/md_content.css";

export const sections = {
  comments: Comments,
  functions: Functions,
  function_outputs: FunctionOutputs,
  loops: Loops,
  comparisons: Comparisons,
  variables: Variables,
  arrays: Arrays,
  while_loops: WhileLoops,
  if_statements: IfStatements,
  strings: Strings,
  creating_functions: CreatingFunctions,
  changing_arrays: ChangingArrays,
};

export type SectionName = keyof typeof sections;

export interface JournalProps {
  section: SectionName;
}

export default function JournalSection(props: JournalProps) {
  const SectionComponent = sections[props.section];
  const { navigateToNextScene } = useSceneNavigator();

  return (
    <>
      <div className="md-content">
        <SectionComponent />
      </div>
      <Flex alignItems="right" justifyContent="right" width="100%">
        <Button colorScheme="blue" onClick={navigateToNextScene}>
          Next
          <MdArrowForward size="1.3em" style={{ marginLeft: "0.2rem" }} />
        </Button>
      </Flex>
    </>
  );
}
