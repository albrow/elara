import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

const addHighlight = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});

const removeHighlight = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    highlights = highlights.map(tr.changes);
    for (let e of tr.effects)
      if (e.is(addHighlight)) {
        highlights = highlights.update({
          add: [highlightMark.range(e.value.from, e.value.to)],
        });
      } else if (e.is(removeHighlight)) {
        highlights = highlights.update({
          filter: (from, to) => {
            return from === e.value.from && to === e.value.to;
          },
        });
      }
    return highlights;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlightMark = Decoration.mark({ class: "bg-gray-400" });

/**
 * Highlights the given line number in the editor (and unhighlights
 * any other lines).
 *
 * @param view The CodeMirror EditorView.
 * @param lineNumber The line number to highlight.
 */
export function highlightLine(view: EditorView, lineNumber: number) {
  let effects: StateEffect<unknown>[] = [];

  if (!view.state.field(highlightField, false))
    effects.push(StateEffect.appendConfig.of([highlightField]));

  try {
    const line = view.state.doc.line(lineNumber);
    if (line.to <= line.from) {
      throw new Error("Invalid line number");
    }
    effects.push(addHighlight.of({ from: line.from, to: line.to }));
    effects.push(removeHighlight.of({ from: line.from, to: line.to }));
  } catch {
    effects.push(removeHighlight.of({ from: 0, to: Infinity }));
  }

  view.dispatch({ effects });
  return true;
}
