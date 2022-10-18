<script lang="ts">
import { defineComponent, ref, shallowRef, Ref } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { basicSetup } from "codemirror";
import { EditorState, Extension } from "@codemirror/state";
import { lintGutter, setDiagnostics } from "@codemirror/lint";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

// TODO(albrow):
// - Implement button handlers for save, load, and run.
// - Implement highlighting active line.
export default {
    components: {
        Codemirror
    },
    props: {
        initialCode: String,
    },
    data() {
        // const extensions = [basicSetup, lintGutter(), keymap.of([indentWithTab])];
        const extensions: Extension[] = [];
        return {
            code: ref(this.initialCode),
            view: null as EditorView | null,
            extensions: extensions as Extension[],
        }
    },
    methods: {
        handleReady(payload: { view: EditorView }) {
            this.view = payload.view;
        },
        noTypeCheck(x: any) {
            return x;
        },
    },
    watch: {
        "initialCode": function (newVal: string, _) {
            this.code = newVal;
        },
        "code": function (newVal: Ref<string>, _) {
            this.$emit("codeChange", { code: newVal });
        },
    },
    emits: {
        codeChange(payload: { code: Ref<string> }) {
            return true;
        }
    },
}
</script>

<template>
    <codemirror v-model="code" placeholder="Write your code here" :autofocus="true" @ready="handleReady"
        :extensions="extensions" class="w-full h-full overflow-scroll p-0">
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
