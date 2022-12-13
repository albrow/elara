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

const highlightMark = Decoration.mark({ class: "line-running" });

// Note(albrow): Many linter rules are disabled in this function.
// When I attempting to address the linter errors, it caused the
// code to not work correctly. Might take a closer look later.
const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    // eslint-disable-next-line no-param-reassign
    highlights = highlights.map(tr.changes);
    // eslint-disable-next-line no-restricted-syntax
    for (const e of tr.effects)
      if (e.is(addHighlight)) {
        // eslint-disable-next-line no-param-reassign
        highlights = highlights.update({
          add: [highlightMark.range(e.value.from, e.value.to)],
        });
      } else if (e.is(removeHighlight)) {
        // eslint-disable-next-line no-param-reassign
        highlights = highlights.update({
          filter: (from, to) => from === e.value.from && to === e.value.to,
        });
      }
    return highlights;
  },
  provide: (f) => EditorView.decorations.from(f),
});

/**
 * Highlights the given line number in the editor (and un-highlights
 * any other lines).
 *
 * @param view The CodeMirror EditorView.
 * @param lineNumber The line number to highlight.
 */
export function highlightLine(view: EditorView, lineNumber: number) {
  const effects: StateEffect<unknown>[] = [];

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

/**
 * Un-highlights all lines in the editor.
 *
 * @param view The CodeMirror EditorView.
 */
export function unhighlightAll(view: EditorView) {
  const effects: StateEffect<unknown>[] = [];

  if (!view.state.field(highlightField, false))
    effects.push(StateEffect.appendConfig.of([highlightField]));

  effects.push(removeHighlight.of({ from: 0, to: Infinity }));

  view.dispatch({ effects });
  return true;
}
