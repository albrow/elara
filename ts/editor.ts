import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { lintGutter } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";

export { setDiagnostics } from "@codemirror/lint";

// TODO(albrow): Add syntax highlighting for Rhai.
export function init(): EditorView {
  let editor = new EditorView({
    parent: document.querySelector("#player-script"),
    state: EditorState.create({
      doc: "// Write your code here!\n\n",
      extensions: [basicSetup, lintGutter()],
    }),
  });

  return editor;
}
