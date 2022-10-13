<script lang="ts">
import Board from "./Board.vue";
import Editor from "./Editor.vue";

export default {
    data() {
        return {};
    },
    components: {
        Board,
        Editor,
    },
};
</script>

<template>
    <div>
        <h1>Level {{ $route.params.levelNumber }}</h1>
        <Editor />
        <Board />
    </div>
</template>
