import { parser } from "@lezer/javascript";
import {
  LRLanguage,
  LanguageSupport,
  delimitedIndent,
  flatIndent,
  continuedIndent,
  indentNodeProp,
} from "@codemirror/language";
import { CompletionContext, Completion } from "@codemirror/autocomplete";
import { EditorView } from "codemirror";

// Functions which take a number of steps as an argument.
const moveFuncNames = ["move_up", "move_down", "move_left", "move_right"];
const moveFuncOptions = moveFuncNames.map((name) => ({
  label: name,
  type: "function",
  // Add the function name and let user input the number of steps.
  apply: (
    view: EditorView,
    completion: Completion,
    from: number,
    to: number
  ) => {
    view.dispatch({
      changes: { from, to, insert: `${completion.label}()` },
      selection: { anchor: from + completion.label.length + 1 },
    });
  },
  detail: "fn",
  info: "(steps: number)",
}));

// Functions which take no arguments.
const nullaryFuncNames = ["random", "read_data"];
const nullaryFuncOptions = nullaryFuncNames.map((name) => ({
  label: name,
  type: "function",
  // Add the function name and put the cursor at the end of the parentheses.
  apply: (
    view: EditorView,
    completion: Completion,
    from: number,
    to: number
  ) => {
    // Note: the `random` function takes no arguments.
    view.dispatch({
      changes: { from, to, insert: `${completion.label}()` },
      selection: { anchor: from + completion.label.length + 2 },
    });
  },
  detail: "fn",
}));

const builtinFuncOptions = [
  ...moveFuncOptions,
  ...nullaryFuncOptions,
  {
    label: "say",
    type: "function",
    // Add the function name and let user input message.
    apply: (
      view: EditorView,
      completion: Completion,
      from: number,
      to: number
    ) => {
      view.dispatch({
        changes: { from, to, insert: `${completion.label}()` },
        selection: { anchor: from + completion.label.length + 1 },
      });
    },
    detail: "fn",
    info: "(message: string)",
  },
];

function completeBuiltinFunction(context: CompletionContext) {
  const word = context.matchBefore(/\w*/);
  // Basic sanity checking to enable/disable autocomplete.
  if (word == null) return null;
  if (word.from === word.to && !context.explicit) return null;
  // TODO(albrow): Don't show completions inside comments.

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
