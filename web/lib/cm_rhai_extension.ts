import { parser } from "@lezer/javascript";
import {
  LRLanguage,
  LanguageSupport,
  delimitedIndent,
  flatIndent,
  continuedIndent,
  indentNodeProp,
} from "@codemirror/language";

// Support very barebones indentation and syntax highlighting for
// Rhai, using JavaScript as a base to build on.
export const rhaiLanguage = LRLanguage.define({
  languageData: {
    name: "rhai",
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$",
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
