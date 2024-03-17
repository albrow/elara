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
import { Compartment } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

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
    info: "Move forward by a number of spaces.",
    apply: applyFuncWithArgs,
  },
  {
    label: "move_backward",
    info: "Move backward by a number of spaces.",
    apply: applyFuncWithArgs,
  },
  {
    label: "move_up",
    info: "Move up by a number of spaces.",
    apply: applyFuncWithArgs,
  },
  {
    label: "move_down",
    info: "Move down by a number of spaces.",
    apply: applyFuncWithArgs,
  },
  {
    label: "move_left",
    info: "Move left by a number of spaces.",
    apply: applyFuncWithArgs,
  },
  {
    label: "move_right",
    info: "Move right by a number of spaces.",
    apply: applyFuncWithArgs,
  },
  {
    label: "get_orientation",
    info: "Outputs whatever direction G.R.O.V.E.R. is facing.",
    apply: applyFuncWithoutArgs,
  },
  {
    label: "read_data",
    info: "Get the data from a nearby data point.",
    apply: applyFuncWithoutArgs,
  },
  {
    label: "say",
    info: "Cause G.R.O.V.E.R. to say something.",
    apply: applyFuncWithArgs,
  },
  {
    label: "press_button",
    info: "Press a nearby button.",
    apply: applyFuncWithoutArgs,
  },
  {
    label: "pick_up",
    info: "Pick up an item in front of G.R.O.V.E.R.",
    apply: applyFuncWithoutArgs,
  },
  {
    label: "drop",
    info: "Drop an item in front of G.R.O.V.E.R.",
    apply: applyFuncWithoutArgs,
  },
];

const builtinFuncOptions = builtInFuncs.map((func) => ({
  ...func,
  type: "function",
}));

function completeBuiltinFunction(autocompleteFuncs: string[]) {
  return (context: CompletionContext) => {
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
      options: builtinFuncOptions.filter((f) =>
        autocompleteFuncs.includes(f.label)
      ),
    };
  };
}

// Support very barebones indentation and syntax highlighting for
// Rhai, using JavaScript as a base to build on.
export function rhaiLanguage(autocompleteFuncs: string[]) {
  return LRLanguage.define({
    languageData: {
      name: "rhai",
      closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
      commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
      indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
      wordChars: "$",
      autocomplete: completeBuiltinFunction(autocompleteFuncs),
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
}

// Returns a LanguageSupport object for Rhai with and enables autocomplete
// for the given function names.
export function rhaiSupport(autocompleteFuncs: string[]) {
  return new LanguageSupport(rhaiLanguage(autocompleteFuncs), []);
}

export function setAutocompleteFuncs(
  view: EditorView,
  autocompleteFuncs: string[]
) {
  const autocompleteCompartment = new Compartment();
  view.dispatch({
    effects: autocompleteCompartment.reconfigure(
      rhaiSupport(autocompleteFuncs)
    ),
  });
  return [autocompleteCompartment.of([])];
}
