import {
  MatchDecorator,
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { hoverWords } from "../components/editor/hover_docs";

const hoverWordRegex = new RegExp(
  hoverWords.map((word) => `\\b${word}\\b`).join("|"),
  "g"
);

const hoverWordMatcher = new MatchDecorator({
  regexp: hoverWordRegex,
  decoration: () =>
    Decoration.mark({
      class: "cm-hoverable",
    }),
});

// A plugin that highlights all hoverable words in the editor.
export const highlightHoverable = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;

    constructor(view: EditorView) {
      this.placeholders = hoverWordMatcher.createDeco(view);
    }

    update(update: ViewUpdate) {
      this.placeholders = hoverWordMatcher.updateDeco(
        update,
        this.placeholders
      );
    }
  },
  {
    decorations: (instance) => instance.placeholders,
  }
);
