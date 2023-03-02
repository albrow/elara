import { Box } from "@chakra-ui/react";
import {
  hoverTooltip,
  Tooltip,
  MatchDecorator,
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { MDXProps } from "mdx/types";
import { createRoot } from "react-dom/client";

import TurnRight from "./pages/turn_right.mdx";
import TurnLeft from "./pages/turn_left.mdx";
import MoveForward from "./pages/move_forward.mdx";
import MoveBackward from "./pages/move_backward.mdx";
import MoveUp from "./pages/move_up.mdx";
import MoveDown from "./pages/move_down.mdx";
import MoveLeft from "./pages/move_left.mdx";
import MoveRight from "./pages/move_right.mdx";
import Say from "./pages/say.mdx";
import Add from "./pages/add.mdx";
import ReadData from "./pages/read_data.mdx";

const hoverWords = [
  "turn_right",
  "turn_left",
  "move_forward",
  "move_backward",
  "move_up",
  "move_down",
  "move_left",
  "move_right",
  "say",
  "add",
  "read_data",
] as const;

export type HoverWord = typeof hoverWords[number];

export const docPages: {
  [key in HoverWord]: (props: MDXProps) => JSX.Element;
} = {
  turn_right: TurnRight,
  turn_left: TurnLeft,
  move_forward: MoveForward,
  move_backward: MoveBackward,
  move_up: MoveUp,
  move_down: MoveDown,
  move_left: MoveLeft,
  move_right: MoveRight,
  say: Say,
  add: Add,
  read_data: ReadData,
};

// A plugin that shows a tooltip with documentation for built-in functions.
function showDocsOnHover(availFuncs: string[]) {
  return hoverTooltip((view, pos, side): Tooltip | null => {
    const { from, to, text } = view.state.doc.lineAt(pos);
    let start = pos;
    let end = pos;
    while (start > from && /\w/.test(text[start - from - 1])) start -= 1;
    while (end < to && /\w/.test(text[end - from])) end += 1;
    if ((start === pos && side < 0) || (end === pos && side > 0)) return null;

    // Disable autocomplete if we're inside a comment.
    const nodeBefore = syntaxTree(view.state).resolveInner(start, -1);
    if (
      nodeBefore.name === "BlockComment" ||
      nodeBefore.name === "LineComment" ||
      nodeBefore.name === "TemplateString" ||
      nodeBefore.name === "String"
    ) {
      return null;
    }

    // word is the text of the word currently under the cursor.
    const word = text.slice(start - from, end - from);
    if (!availFuncs.includes(word)) return null;
    const Page = docPages[word as HoverWord];

    return {
      pos: start,
      end,
      create() {
        const dom = document.createElement("div");
        const root = createRoot(dom);
        root.render(
          <Box px="15px" pb="5px" maxW="500px" className="md-content hover-doc">
            <Page />
          </Box>
        );
        return { dom };
      },
    };
  });
}

function hoverWordRegex(availFuncs: string[]) {
  if (availFuncs.length === 0) {
    // A regex that will never match anything.
    return /$^/g;
  }
  return new RegExp(availFuncs.map((word) => `\\b${word}\\b`).join("|"), "g");
}

function hoverWordMatcher(availFuncs: string[]) {
  return new MatchDecorator({
    regexp: hoverWordRegex(availFuncs),
    decoration: () =>
      Decoration.mark({
        class: "cm-hoverable",
      }),
  });
}

// A plugin that highlights all hoverable words in the editor.
function highlightHoverable(availFuncs: string[]) {
  if (availFuncs.length === 0) {
    // If there are no hoverable words, don't bother creating a plugin.
    return [];
  }
  const matcher = hoverWordMatcher(availFuncs);
  return ViewPlugin.fromClass(
    class {
      placeholders: DecorationSet;

      constructor(view: EditorView) {
        this.placeholders = matcher.createDeco(view);
      }

      update(update: ViewUpdate) {
        this.placeholders = matcher.updateDeco(update, this.placeholders);
      }
    },
    {
      decorations: (instance) => instance.placeholders,
    }
  );
}

// A CodeMirror extension that both shows hover docs and highlights hoverable
// words.
//
// availableFunctions is an array of strings that are the names of the
// functions that should be highlighted and have hover docs.
export function hoverDocs(availableFunctions: string[]) {
  return [
    showDocsOnHover(availableFunctions),
    highlightHoverable(availableFunctions),
  ];
}
