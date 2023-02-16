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
import { highlightHoverable } from "../../lib/highlight_hoverable";
import { hoverDocs } from "./hover_docs";

const extensions = [
  lintGutter(),
  keymap.of([indentWithTab]),
  rhaiSupport(),
  hoverDocs,
  highlightHoverable,
];

export interface CodeError {
  line: number;
  col: number;
  message: string;
}

export type EditorType = "level" | "example";

interface EditorProps {
  code: string;
  type: EditorType;
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
    caret: "var(--chakra-colors-gray-700)",
    selection: "var(--chakra-colors-gray-300)",
    selectionMatch: "var(--chakra-colors-green-200)",
    lineHighlight: "transparent",
    gutterBackground: "var(--chakra-colors-gray-200)",
    gutterForeground: "var(--chakra-colors-gray-500)",
    gutterBorder: "var(--chakra-colors-gray-300)",
  },
  styles: [
    {
      tag: t.comment,
      class: "cm-comment",
    },
    {
      tag: t.string,
      class: "cm-string",
    },
  ],
});

function codeErrorToDiagnostic(view: EditorView, e: CodeError): Diagnostic {
  // In Rhai, positions are composed of (line, column), but
  // CodeMirror wants the absolute position. We need to do
  // some math to convert between the two.
  //
  // For now, we just want to highlight the entire line where
  // the error occurred.
  const line = view.viewportLineBlocks[e.line - 1];

  if (line.length === 0) {
    // This should never happen, but it in practice it sometimes occurs
    // if the line only contains whitespace. If this does happen, just
    // highlight the first character of the line.
    return {
      from: line.from,
      to: line.from,
      message: e.message,
      severity: "error",
    };
  }

  return {
    from: line.from,
    to: line.from + line.length - 1,
    message: e.message,
    severity: "error",
  };
}

export default function Editor(props: EditorProps) {
  const editor = useRef<HTMLDivElement | null>(null);

  const height = props.type === "level" ? "377px" : undefined;
  const sizeClass = props.type === "level" ? "level-sized" : undefined;

  const { setContainer, view } = useCodeMirror({
    height,
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
    props.setGetCodeHandler(() => view?.state.doc.toString() || "");
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer]);

  useEffect(() => {
    if (view) {
      if (props.activeLine) {
        highlightLine(view, props.activeLine.line);
      } else {
        unhighlightAll(view);
      }
    }
  }, [props.activeLine, view]);

  useEffect(() => {
    if (view) {
      if (props.codeError) {
        const diagnostic = codeErrorToDiagnostic(view, props.codeError);
        view.dispatch(setDiagnostics(view.state, [diagnostic]));
      } else {
        view.dispatch(setDiagnostics(view.state, []));
      }
    }
  }, [props.codeError, view]);

  return (
    <Box id="editor-wrapper" className={sizeClass}>
      <div ref={editor} />
    </Box>
  );
}
