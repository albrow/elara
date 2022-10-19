import { indentWithTab } from "@codemirror/commands";
import { lintGutter, setDiagnostics, Diagnostic } from "@codemirror/lint";
import { keymap, EditorView } from "@codemirror/view";
import { useCodeMirror } from "@uiw/react-codemirror";
import { basicSetup } from "codemirror";
import { useEffect, useLayoutEffect, useRef } from "react";

import { highlightLine, unhighlightAll } from "../../lib/highlight_line";
import { LinePos } from "../../lib/state";
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
  const line = view.viewportLineBlocks[e.line - 1];
  // start is the absolute position where the error
  // first occurred, but we still need to get a range.
  let start = line.from + e.col;
  // Use wordAt to get a range encapsulating the "word" that
  // caused the error.
  let range = view.state.wordAt(start);

  while (range === null) {
    // If wordAt returns null, it means that the error occurred
    // on a non-word character. In this case, we can just
    // decrement the position and try again to find the closest
    // word.
    start -= 1;
    range = view.state.wordAt(start);
  }
  return {
    from: range.from,
    to: range.to,
    message: e.message,
    severity: "error",
  };
}
