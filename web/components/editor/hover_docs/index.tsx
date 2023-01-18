import { Box } from "@chakra-ui/react";
import { hoverTooltip, Tooltip } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { MDXProps } from "mdx/types";
import { createRoot } from "react-dom/client";

import MoveUp from "./pages/move_up.mdx";
import MoveDown from "./pages/move_down.mdx";
import MoveLeft from "./pages/move_left.mdx";
import MoveRight from "./pages/move_right.mdx";
import Say from "./pages/say.mdx";
import Random from "./pages/random.mdx";
import ReadData from "./pages/read_data.mdx";

export const hoverWords = [
  "move_up",
  "move_down",
  "move_left",
  "move_right",
  "say",
  "random",
  "read_data",
] as const;

export type HoverWord = typeof hoverWords[number];

const docPages: {
  [key in HoverWord]: (props: MDXProps) => JSX.Element;
} = {
  move_up: MoveUp,
  move_down: MoveDown,
  move_left: MoveLeft,
  move_right: MoveRight,
  say: Say,
  random: Random,
  read_data: ReadData,
};

export const hoverDocs = hoverTooltip((view, pos, side): Tooltip | null => {
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
  if (!(word in docPages)) return null;
  const Page = docPages[word as HoverWord];

  return {
    pos: start,
    end,
    create() {
      const dom = document.createElement("div");
      const root = createRoot(dom);
      root.render(
        <Box
          px="15px"
          pb="5px"
          maxW="500px"
          className="md-content hover-doc"
          bg="red.500"
        >
          <Page />
        </Box>
      );
      return { dom };
    },
  };
});
