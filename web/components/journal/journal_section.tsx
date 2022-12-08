import Functions from "./sections/functions.mdx";
import Comments from "./sections/comments.mdx";
import Expressions from "./sections/expressions.mdx";
import WhileLoops from "./sections/while_loops.mdx";
import Variables from "./sections/variables.mdx";
import Literals from "./sections/literals.mdx";
import Arrays from "./sections/arrays.mdx";
import MathExpressions from "./sections/math_expressions.mdx";
import Comparisons from "./sections/comparisons.mdx";
import IfStatements from "./sections/if_statements.mdx";
import "../../styles/md_content.css";

export const sections = {
  Comments: Comments,
  Functions: Functions,
  Expressions: Expressions,
  Literals: Literals,
  "Math Expressions": MathExpressions,
  Comparisons: Comparisons,
  Variables: Variables,
  Arrays: Arrays,
  "While Loops": WhileLoops,
  "If Statements": IfStatements,
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
