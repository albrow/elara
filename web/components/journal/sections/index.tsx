import Functions from "./functions.mdx";
import FunctionOutputs from "./function_outputs.mdx";
import Comments from "./comments.mdx";
import WhileLoops from "./while_loops.mdx";
import Variables from "./variables.mdx";
import Comparisons from "./comparisons.mdx";
import IfStatements from "./if_statements.mdx";
import Loops from "./loops.mdx";
import Strings from "./strings.mdx";
import CreatingFunctions from "./creating_functions.mdx";

export const JOURNAL_SECTIONS = {
  comments: Comments,
  functions: Functions,
  function_outputs: FunctionOutputs,
  loops: Loops,
  comparisons: Comparisons,
  variables: Variables,
  while_loops: WhileLoops,
  if_statements: IfStatements,
  strings: Strings,
  creating_functions: CreatingFunctions,
};

export type SectionName = keyof typeof JOURNAL_SECTIONS;
