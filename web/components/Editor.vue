<script lang="ts">
import { defineComponent, ref, shallowRef, Ref } from 'vue'
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
    props: {
        initialCode: String,
    },
    data() {
        return {
            code: ref(this.initialCode),
        }
    },
    watch: {
        "initialCode": function (newVal: string, _) {
            this.code = newVal;
        },
        "code": function (newVal: Ref<string>, _) {
            this.$emit("codeChange", { code: newVal });
        },
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
            log: (..._: any[]) => undefined
        }
    },
    emits: {
        codeChange(payload: { code: Ref<string> }) {
            return true;
        }
    }
})
</script>

<template>
    <codemirror v-model="code" placeholder="Write your code here" :autofocus="true" :extensions="extensions"
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
