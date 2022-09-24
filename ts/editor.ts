import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { lintGutter } from "@codemirror/lint";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

export { setDiagnostics } from "@codemirror/lint";

// TODO(albrow): Add syntax highlighting for Rhai.
export function init(): EditorView {
  let editor = new EditorView({
    parent: document.querySelector("#player-script"),
    state: EditorState.create({
      doc: "// Write your code here!\n\nfor i in 0..2 {\n  move_right(2);\n  move_down(2);\n}\n",
      extensions: [basicSetup, lintGutter(), keymap.of([indentWithTab])],
    }),
  });

  return editor;
}
