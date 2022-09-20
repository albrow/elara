import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";

// TODO(albrow): Add syntax highlighting for Rhai.
export function init(): EditorView {
  let editor = new EditorView({
    extensions: [basicSetup],
    parent: document.querySelector("#player-script"),
    state: EditorState.create({
      doc: "// Write your code here!\n\n",
      extensions: [basicSetup],
    }),
  });
  return editor;
}
