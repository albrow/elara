import { Button, Flex } from "@chakra-ui/react";
import { MdArrowForward } from "react-icons/md";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getNextSceneFromRoute } from "../../lib/scenes";

import Functions from "./sections/functions.mdx";
import FunctionOutputs from "./sections/function_outputs.mdx";
import Comments from "./sections/comments.mdx";
import Expressions from "./sections/expressions.mdx";
import WhileLoops from "./sections/while_loops.mdx";
import Variables from "./sections/variables.mdx";
import Literals from "./sections/literals.mdx";
import Arrays from "./sections/arrays.mdx";
import MathExpressions from "./sections/math_expressions.mdx";
import Comparisons from "./sections/comparisons.mdx";
import IfStatements from "./sections/if_statements.mdx";
import Loops from "./sections/loops.mdx";
import Strings from "./sections/strings.mdx";
import "../../styles/md_content.css";

export const sections = {
  comments: Comments,
  functions: Functions,
  function_outputs: FunctionOutputs,
  expressions: Expressions,
  literals: Literals,
  math_expressions: MathExpressions,
  loops: Loops,
  comparisons: Comparisons,
  variables: Variables,
  arrays: Arrays,
  while_loops: WhileLoops,
  if_statements: IfStatements,
  strings: Strings,
};

export type SectionName = keyof typeof sections;

export interface JournalProps {
  section: SectionName;
}

export default function JournalSection(props: JournalProps) {
  const SectionComponent = sections[props.section];
  const location = useLocation();
  const navigate = useNavigate();

  const navigateToNextScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(location.pathname);
    if (nextScene == null) {
      throw new Error("Invalid route");
    }
    navigate(nextScene.route);
  }, [location, navigate]);

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
