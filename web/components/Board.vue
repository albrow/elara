<script lang="ts">
import { Pos, State } from "../lib/state";
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from "../lib/constants";
import { PropType } from "vue";

const PLAYER_Z_INDEX = 200;
const FUEL_Z_INDEX = 100;

interface Offset {
    top: string;
    left: string;
}

function posToOffset(pos: Pos): Offset {
    return {
        left: `${pos.y * (TILE_SIZE + 1) + 1}px`,
        top: `${pos.x * (TILE_SIZE + 1) + 1}px`,
    }
}

export default {
    props: {
        width: Number,
        height: Number,
        gameState: {
            type: Object as PropType<State>,
            required: true,
        },
    },
    data() {
        return {
            tileSize: TILE_SIZE,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
            playerZIndex: PLAYER_Z_INDEX,
            fuelZIndex: FUEL_Z_INDEX,
        }
    },
    computed: {
        // Converts board dimensions to pixel offsets.
        playerOffset(): Offset {
            return posToOffset(this.gameState.player.pos);
        },
        fuelOffsets(): Offset[] {
            return this.gameState.fuel.map(fuel => posToOffset(fuel.pos));
        },
    },
};
</script>

<template>
    <div id="board">
        <table class="table-fixed" :style="{'width': canvasWidth + 'px', 'height': canvasHeight + 'px'}">
            <tbody>
                <tr v-for="y in height" :key="y" class="row">
                    <td v-for="x in width" :key="x" class="square">
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <img class="player" src="/images/robot.png"
        :style="{'width': tileSize + 'px', 'height': tileSize + 'px', 'z-index': playerZIndex, 'left': playerOffset.left, 'top': playerOffset.top}" />
    <template v-for="fuel in fuelOffsets" :key="fuel">
        <img class="fuel" src="/images/fuel.png"
            :style="{'width': tileSize + 'px', 'height': tileSize + 'px', 'z-index': fuelZIndex, 'left': fuel.left, 'top': fuel.top}" />
    </template>
</template>

<style>
table {
    background-color: #ccc;
    border: 1px solid black;
    border-collapse: collapse;
}

table td,
table th {
    border: 1px solid #000;
}

table tr:first-child th {
    border-top: 0;
}

table tr:last-child td {
    border-bottom: 0;
}

table tr td:first-child,
table tr th:first-child {
    border-left: 0;
}

table tr td:last-child,
table tr th:last-child {
    border-right: 0;
}

.player {
    position: absolute;
}

.fuel {
    position: absolute;
}
</style>
