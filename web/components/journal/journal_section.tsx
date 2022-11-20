import Function from "./sections/function.mdx";
import Comment from "./sections/comment.mdx";
import WhileLoop from "./sections/while_loop.mdx";
import Variable from "./sections/variable.mdx";
import Array from "./sections/array.mdx";
import IfStatement from "./sections/if_statement.mdx";
import "./journal_section.css";

export const sections = {
  Comment: Comment,
  Function: Function,
  "While Loop": WhileLoop,
  Variable: Variable,
  Array: Array,
  "If Statement": IfStatement,
};

export type SectionName = keyof typeof sections;

export interface JournalProps {
  section: SectionName;
}

export default function JournalSection(props: JournalProps) {
  const SectionComponent = sections[props.section];

  return (
    <div id="journal-content">
      <SectionComponent />
    </div>
  );
}
