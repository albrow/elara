<script lang="ts">
import { defineComponent, ref, shallowRef } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { lintGutter } from "@codemirror/lint";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

// TODO(albrow):
// - Implement button handlers for save, load, and run.
// - Implement highlighting active line.
export default defineComponent({
    components: {
        Codemirror
    },
    setup() {
        const extensions = [basicSetup, lintGutter(), keymap.of([indentWithTab])];

        // Codemirror EditorView instance ref
        const view = shallowRef()
        const handleReady = (payload: any) => {
            view.value = payload.view
        }

        // Status is available at all times via Codemirror EditorView
        const getCodemirrorStates = () => {
            // const state = view.value.state
            // const ranges = state.selection.ranges
            // const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
            // const cursor = ranges[0].anchor
            // const length = state.doc.length
            // const lines = state.doc.lines
            // more state info ...
            // return ...
        }

        return {
            extensions,
            handleReady,
            // log: console.log
            log: (...data: any[]) => undefined
        }
    },
    data() {
        return {
            code: "console.log('Hello World')"
        }
    }
})
</script>

<template>
    <!-- TODO(albrow): Move control panel to separate template? -->
    <!-- Control panel -->
    <div class="grid grid-flow-col bg-gray-800 rounded-t-md p-2">
        <!-- Left aligned buttons -->
        <div class="flex justify-start justify-self-start gap-2">
            <button id="run-button" class="bg-emerald-500 active:bg-emerald-600 rounded p-1 px-3 font-semibold">
                ▶ Run
            </button>
        </div>
        <!-- Right aligned buttons -->
        <div class="flex justify-end justify-self-end gap-2">
            <button id="save-button" class="bg-gray-300 rounded p-1 px-3 font-semibold">
                Save
            </button>
            <button id="load-button" class="bg-gray-300 rounded p-1 px-3 font-semibold">
                Load
            </button>
        </div>
    </div>
    <codemirror v-model="code" placeholder="// Code goes here..." :autofocus="true" :extensions="extensions"
        @ready="handleReady" class="w-full h-full overflow-scroll p-0">
    </codemirror>
</template>

<style>
.cm-editor {
    height: 361px;
    border-width: 2px;
    border-top: 0px;
    border-color: rgb(31 41 55);
    border-bottom-right-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
    padding: 1px;
}

.cm-scroller {
    overflow: auto;
}
</style>
