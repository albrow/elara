import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup } from "codemirror";
import { lintGutter } from "@codemirror/lint";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

import "./editor.css";

const extensions = [basicSetup, lintGutter(), keymap.of([indentWithTab])];

interface EditorProps {
  code: string;
  onChange: (code: string) => void;
}

export default function Editor(props: EditorProps) {
  return (
    <div id="editor-wrapper" className="w-full h-full p-0">
      <CodeMirror
        value={props.code}
        height="357px"
        extensions={extensions}
        onChange={props.onChange}
      />
    </div>
  );
}
