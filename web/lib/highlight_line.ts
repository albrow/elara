import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { StateField, StateEffect, StateEffectType } from "@codemirror/state";

const primaryHighlightMark = Decoration.mark({ class: "active-line-primary" });
const secondaryHighlightMark = Decoration.mark({
  class: "active-line-secondary",
});

const addPrimaryHighlight = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});

const removePrimaryHighlight = StateEffect.define<{ from: number; to: number }>(
  {
    map: ({ from, to }, change) => ({
      from: change.mapPos(from),
      to: change.mapPos(to),
    }),
  }
);

const addSecondaryHighlight = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});

const removeSecondaryHighlight = StateEffect.define<{
  from: number;
  to: number;
}>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});

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
      if (e.is(addPrimaryHighlight)) {
        // eslint-disable-next-line no-param-reassign
        highlights = highlights.update({
          add: [primaryHighlightMark.range(e.value.from, e.value.to)],
        });
      } else if (e.is(removePrimaryHighlight)) {
        // eslint-disable-next-line no-param-reassign
        highlights = highlights.update({
          filter: (from, to) => from === e.value.from && to === e.value.to,
        });
      } else if (e.is(addSecondaryHighlight)) {
        // eslint-disable-next-line no-param-reassign
        highlights = highlights.update({
          add: [secondaryHighlightMark.range(e.value.from, e.value.to)],
        });
      } else if (e.is(removeSecondaryHighlight)) {
        // eslint-disable-next-line no-param-reassign
        highlights = highlights.update({
          filter: (from, to) => from === e.value.from && to === e.value.to,
        });
      }
    return highlights;
  },
  provide: (f) => EditorView.decorations.from(f),
});

type HighlightEffectType = StateEffectType<{
  from: number;
  to: number;
}>;

function getEffectsForLines(
  view: EditorView,
  highlightEffect: HighlightEffectType,
  lineNumbers: number[]
): StateEffect<unknown>[] {
  const effects: StateEffect<unknown>[] = [];

  try {
    lineNumbers.forEach((lineNumber) => {
      if (!view.state.field(highlightField, false))
        effects.push(StateEffect.appendConfig.of([highlightField]));

      const line = view.state.doc.line(lineNumber);
      if (line.to <= line.from) {
        throw new Error("Invalid line number");
      }
      effects.push(highlightEffect.of({ from: line.from, to: line.to }));
    });
  } catch {
    // Can sometimes happen if the editor is in a weird state. Just ignore it here.
    // Effectively this will remove any highlighted lines.
    return [];
  }
  return effects;
}

/**
 * Highlights the given line numbers in the editor (and un-highlights
 * any other lines). The last line number in the array will be considered
 * the "primary" line, and will be highlighted with a different style.
 *
 * @param view The CodeMirror EditorView.
 * @param lineNumbers The line numbers to highlight.
 */
export function highlightLines(view: EditorView, lineNumbers: number[]) {
  let effects: StateEffect<unknown>[] = [];

  // First remove any existing highlights.
  effects.push(removePrimaryHighlight.of({ from: 0, to: Infinity }));

  if (lineNumbers.length >= 1) {
    // The "primary" active line is the last line in the array.
    const primaryLineNumber = lineNumbers[lineNumbers.length - 1];
    effects = effects.concat(
      getEffectsForLines(view, addPrimaryHighlight, [primaryLineNumber])
    );
  }
  if (lineNumbers.length >= 2) {
    // The "secondary" active lines are all other lines in the array.
    const secondaryLineNumbers = lineNumbers.slice(0, lineNumbers.length - 1);
    effects = effects.concat(
      getEffectsForLines(view, addSecondaryHighlight, secondaryLineNumbers)
    );
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

  effects.push(removePrimaryHighlight.of({ from: 0, to: Infinity }));
  effects.push(removeSecondaryHighlight.of({ from: 0, to: Infinity }));

  view.dispatch({ effects });
  return true;
}
