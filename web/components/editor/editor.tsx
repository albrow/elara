import { indentWithTab } from "@codemirror/commands";
import { lintGutter, setDiagnostics, Diagnostic } from "@codemirror/lint";
import { keymap, EditorView } from "@codemirror/view";
import { useCodeMirror } from "@uiw/react-codemirror";
import { basicSetup } from "codemirror";
import { useEffect, useLayoutEffect, useRef } from "react";

import { highlightLine, unhighlightAll } from "../../lib/highlight_line";
import { LinePos } from "../../../elara-lib/pkg";
import "./editor.css";

const extensions = [basicSetup, lintGutter(), keymap.of([indentWithTab])];

export interface CodeError {
  line: number;
  col: number;
  message: string;
}

interface EditorProps {
  code: string;
  editable: boolean;
  onChange: (code: string) => void;
  activeLine?: LinePos;
  codeError?: CodeError;
}

export default function Editor(props: EditorProps) {
  const editor = useRef<HTMLDivElement | null>(null);

  const { setContainer, view } = useCodeMirror({
    onChange: props.onChange,
    height: "357px",
    editable: props.editable,
    readOnly: !props.editable,
    container: editor.current,
    extensions,
    value: props.code,
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [editor.current]);

  useLayoutEffect(() => {
    if (view) {
      if (props.activeLine) {
        highlightLine(view, props.activeLine.line);
      } else {
        unhighlightAll(view);
      }
    }
  }, [props.activeLine]);

  useLayoutEffect(() => {
    if (view) {
      if (props.codeError) {
        const diagnostic = codeErrorToDiagnostic(view, props.codeError);
        view.dispatch(setDiagnostics(view.state, [diagnostic]));
      } else {
        view.dispatch(setDiagnostics(view.state, []));
      }
    }
  }, [props.codeError]);

  return (
    <div id="editor-wrapper" className="w-full h-full p-0">
      <div ref={editor} />
    </div>
  );
}

function codeErrorToDiagnostic(view: EditorView, e: CodeError): Diagnostic {
  // In Rhai, positions are composed of (line, column), but
  // CodeMirror wants the absolute position. We need to do
  // some math to convert between the two.
  //
  // For now, we just want to highlight the entire line where
  // the error occurred.
  const line = view.viewportLineBlocks[e.line - 1];

  return {
    from: line.from,
    to: line.from + line.length - 1,
    message: e.message,
    severity: "error",
  };
}
