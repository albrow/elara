import { indentWithTab } from "@codemirror/commands";
import { lintGutter, setDiagnostics, Diagnostic } from "@codemirror/lint";
import { keymap, EditorView } from "@codemirror/view";
import { useCodeMirror } from "@uiw/react-codemirror";
import { useEffect, useRef } from "react";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { Box } from "@chakra-ui/react";

import { highlightLine, unhighlightAll } from "../../lib/highlight_line";
import { LinePos } from "../../../elara-lib/pkg";
import { rhaiSupport } from "../../lib/cm_rhai_extension";
import "./editor.css";

const extensions = [lintGutter(), keymap.of([indentWithTab]), rhaiSupport()];

export interface CodeError {
  line: number;
  col: number;
  message: string;
}

interface EditorProps {
  code: string;
  editable: boolean;
  setGetCodeHandler: (handler: () => string) => void;
  activeLine?: LinePos;
  codeError?: CodeError;
}

const myTheme = createTheme({
  theme: "light",
  settings: {
    background: "#ffffff",
    foreground: "#000000",
    caret: "#374151",
    selection: "#9ca3af77",
    selectionMatch: "#9ca3af77",
    lineHighlight: "#00000000",
    gutterBackground: "#e5e7ebdd",
    gutterForeground: "#9ca3af",
    gutterBorder: "#d1d5db",
  },
  styles: [{ tag: t.comment, color: "var(--chakra-colors-green-600)" }],
});

export default function Editor(props: EditorProps) {
  const editor = useRef<HTMLDivElement | null>(null);

  const { setContainer, view } = useCodeMirror({
    height: "377px",
    editable: props.editable,
    readOnly: !props.editable,
    container: editor.current,
    extensions,
    value: props.code,
    theme: myTheme,
  });

  // Note(albrow): This is a bit of a hack but greatly improves performance.
  //
  // Using the CodeMirror.onChange function to update the code in the parent
  // every time it changes can easily cause browser jank, so we use this
  // callback instead. When the parent needs to get the current code (e.g.
  // when the "Run" button is pressed), it calls the callback set by
  // setGetCodeHandler.
  useEffect(() => {
    props.setGetCodeHandler(() => {
      return view?.state.doc.toString() || "";
    });
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [editor.current]);

  useEffect(() => {
    if (view) {
      if (props.activeLine) {
        highlightLine(view, props.activeLine.line);
      } else {
        unhighlightAll(view);
      }
    }
  }, [props.activeLine]);

  useEffect(() => {
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
    <Box id="editor-wrapper">
      <div ref={editor} />
    </Box>
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
