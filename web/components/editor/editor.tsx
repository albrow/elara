import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup } from "codemirror";
import { lintGutter } from "@codemirror/lint";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

import "./editor.css";

const extensions = [basicSetup, lintGutter(), keymap.of([indentWithTab])];

export default function Editor() {
  const onChange = React.useCallback((value: any, _: any) => {
    console.log("value:", value);
  }, []);
  return (
    <div id="editor-wrapper" className="w-full h-full p-0">
      <CodeMirror
        value=""
        height="357px"
        extensions={extensions}
        onChange={onChange}
      />
    </div>
  );
}
