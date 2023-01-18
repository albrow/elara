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

  return (
    <div className="md-content">
      <SectionComponent />
    </div>
  );
}
