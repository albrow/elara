<script lang="ts">
import { PropType } from "vue";

import Board from "./Board.vue";
import { State } from "../lib/state";

const GAME_SPEED = 1; // steps per second
const MS_PER_STEP = 1000 / GAME_SPEED;

export default {
    components: {
        Board,
    },
    props: {
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
        states: {
            type: Array as PropType<State[]>,
            required: true,
        },
    },
}
</script>

<template>
    <Board :width="width" :height="height" :game-state="states[0]"></Board>
</template>
