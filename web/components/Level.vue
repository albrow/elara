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
        <div class="2xl:container 2xl:mx-auto my-4">
            <div class="flex flex-row px-4">
                <!-- Editor and control pannel -->
                <div class="flex w-full flex-col">

                    <!-- Editor -->
                    <div id="player-script" name="player-script">
                        <Editor />
                    </div>
                </div>
                <!-- Game board -->
                <div class="px-4">
                    <div id="board-wrapper" class="relative">
                        <Board />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
