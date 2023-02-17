import { parser } from "@lezer/javascript";
import {
  syntaxTree,
  LRLanguage,
  LanguageSupport,
  delimitedIndent,
  flatIndent,
  continuedIndent,
  indentNodeProp,
} from "@codemirror/language";
import { CompletionContext, Completion } from "@codemirror/autocomplete";
import { EditorView } from "codemirror";

interface PartialFuncOption {
  label: string;
  info: string;
  apply: (
    view: EditorView,
    completion: Completion,
    from: number,
    to: number
  ) => void;
}

// Implementation of Completion.apply for a function which takes no arguments.
function applyFuncWithoutArgs(
  view: EditorView,
  completion: Completion,
  from: number,
  to: number
) {
  view.dispatch({
    changes: { from, to, insert: `${completion.label}()` },
    selection: { anchor: from + completion.label.length + 2 },
  });
}

// Implementation of Completion.apply for a function which takes at least one argument.
function applyFuncWithArgs(
  view: EditorView,
  completion: Completion,
  from: number,
  to: number
) {
  view.dispatch({
    changes: { from, to, insert: `${completion.label}()` },
    selection: { anchor: from + completion.label.length + 1 },
  });
}

const builtInFuncs: PartialFuncOption[] = [
  {
    label: "turn_right",
    info: "Turn right (i.e. clockwise) by 90 degrees.",
    apply: applyFuncWithoutArgs,
  },
  {
    label: "turn_left",
    info: "Turn left (i.e. counter-clockwise) by 90 degrees.",
    apply: applyFuncWithoutArgs,
  },
  {
    label: "move_forward",
    info: "Move forward one space.",
    apply: applyFuncWithoutArgs,
  },
  {
    label: "move_backward",
    info: "Move backward one space.",
    apply: applyFuncWithoutArgs,
  },
  {
    label: "move_up",
    info: "Move up by a number of steps.",
    apply: applyFuncWithArgs,
  },
  {
    label: "move_down",
    info: "Move down by a number of steps.",
    apply: applyFuncWithArgs,
  },
  {
    label: "move_left",
    info: "Move left by a number of steps.",
    apply: applyFuncWithArgs,
  },
  {
    label: "move_right",
    info: "Move right by a number of steps.",
    apply: applyFuncWithArgs,
  },
  // The add function is just for teaching purposes, so we
  // don't want to autocomplete it.
  // {
  //   label: "add",
  //   info: "Add two numbers together and return the result.",
  //   apply: applyFuncWithArgs,
  // },
  {
    label: "read_data",
    info: "Read data from a nearby data terminal.",
    apply: applyFuncWithoutArgs,
  },
  {
    label: "say",
    info: "Cause G.R.O.V.E.R. to say something",
    apply: applyFuncWithArgs,
  },
];

const builtinFuncOptions = builtInFuncs.map((func) => ({
  ...func,
  type: "function",
}));

function completeBuiltinFunction(context: CompletionContext) {
  const word = context.matchBefore(/\w*/);
  // Basic sanity checking to enable/disable autocomplete.
  if (word == null) return null;
  if (word.from === word.to && !context.explicit) return null;

  // Disable autocomplete if we're inside a comment.
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (
    nodeBefore.name === "BlockComment" ||
    nodeBefore.name === "LineComment" ||
    nodeBefore.name === "TemplateString" ||
    nodeBefore.name === "String"
  )
    return null;

  return {
    from: word.from,
    options: builtinFuncOptions,
  };
}

// Support very barebones indentation and syntax highlighting for
// Rhai, using JavaScript as a base to build on.
export const rhaiLanguage = LRLanguage.define({
  languageData: {
    name: "rhai",
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$",
    autocomplete: completeBuiltinFunction,
  },
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        IfStatement: continuedIndent({ except: /^\s*({|else\b)/ }),
        LabeledStatement: flatIndent,
        Block: delimitedIndent({ closing: "}" }),
        "TemplateString BlockComment": () => null,
        "Statement Property": continuedIndent({ except: /^{/ }),
      }),
    ],
  }),
});

export function rhaiSupport() {
  return new LanguageSupport(rhaiLanguage, []);
}
