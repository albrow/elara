<script lang="ts">
import { ref, Ref } from "vue";

import {
    Game,
    RhaiError,
    RunResult,
    // Outcome,
} from "../../battle-game-lib/pkg";

import Board from "./Board.vue";
import Editor from "./Editor.vue";
import { WIDTH, HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT } from "../lib/constants";
import { rustToJsState, rustToJsStateWithPos, State, StateWithPos } from "../lib/state";

const GAME_SPEED = 1; // steps per second
const MS_PER_STEP = 1000 / GAME_SPEED;
const BACKGROUND_COLOR = 0xcccccc;
type Outcome = "continue" | "success" | "failure";

export default {
    components: {
        Board,
        Editor,
    },
    data() {
        // Create the game and load the level.
        const game = Game.new(WIDTH, HEIGHT);
        const levelIndex = Number(this.$route.params.levelNumber) - 1;
        game.load_level(levelIndex);

        return {
            width: WIDTH,
            height: HEIGHT,
            game: game as Game,
            levelNumber: Number(this.$route.params.levelNumber),
            currentCode: game.initial_code(),
            currentState: emptyLineState(rustToJsState(game.initial_state())),
            replayTicker: null as number | null,
        };
    },
    beforeMount() {
        this.loadLevelFromRoute(this.$route);
    },
    beforeRouteUpdate(to, from) {
        // When the route changes, load the new level into the game and
        // set the new state.
        this.loadLevelFromRoute(to);
    },
    methods: {
        handleCodeChange(payload: { code: Ref<string> }) {
            // @ts-ignore
            this.currentCode = payload.code;
        },
        loadLevelFromRoute(route: any) {
            const levelIndex = Number(route.params.levelNumber) - 1;
            this.game.load_level(levelIndex);
            const initialState = rustToJsState(this.game.initial_state());
            this.currentState = emptyLineState(initialState);
            this.currentCode = this.game.initial_code();
        },
        async runScript() {
            // Reset game state and ticker.
            this.game.reset();
            if (this.replayTicker) {
                clearInterval(this.replayTicker);
            }
            this.currentState = emptyLineState(this.game.initial_state());

            // Remove any error messages from the editor.
            // editor.dispatch(setDiagnostics(editor.state, []));
            // Run the simulation.
            let runResult: RunResult;
            try {
                runResult = (await this.game.run_player_script(
                    this.currentCode
                )) as unknown as RunResult;
            } catch (e) {
                // If there is an error, display it in the editor.
                if (e instanceof RhaiError) {
                    console.log(`${e.message}`);

                    // TODO(albrow): Re-implement this.
                    //
                    // // In Rhai, positions are composed of (line, column), but
                    // // CodeMirror wants the absolute position. We need to do
                    // // some math to convert between the two.
                    // const line = editor.viewportLineBlocks[e.line - 1];
                    // // start is the absolute position where the error
                    // // first occurred, but we still need to get a range.
                    // let start = line.from + e.col;
                    // // Use wordAt to get a range encapsulating the "word" that
                    // // caused the error.
                    // let range = editor.state.wordAt(start);
                    // while (range === null) {
                    //     // If wordAt returns null, it means that the error occurred
                    //     // on a non-word character. In this case, we can just
                    //     // decrement the position and try again to find the closest
                    //     // word.
                    //     start -= 1;
                    //     range = editor.state.wordAt(start);
                    // }
                    // editor.dispatch(
                    //     setDiagnostics(editor.state, [
                    //         {
                    //             from: range.from,
                    //             to: range.to,
                    //             message: e.message,
                    //             severity: "error",
                    //         },
                    //     ])
                    // );
                    return;
                } else {
                    throw e;
                }
            }
            const replayStates = runResult.states.map(rustToJsStateWithPos);
            await this.runRelay(replayStates, runResult.outcome as Outcome);
        },
        async runRelay(states: StateWithPos[], outcome: Outcome) {
            // Start stepIndex at 1 because we are already rendering the initial state.
            let stepIndex = 1;
            this.replayTicker = setInterval(() => {
                // TODO(albrow): Scroll the editor window to make sure the currently running
                // line is visible.
                // See: https://stackoverflow.com/questions/10575343/
                if (stepIndex < states.length) {
                    let step = states[stepIndex];
                    this.currentState = step;
                    // TODO(albrow): forceUpdate should not be necessary here because
                    // Vue should be updating the component automatically. Try to remove this
                    // later if possible.
                    // this.$forceUpdate();

                    // TODO(albrow): Re-implement this.
                    //
                    // // Highlight the line that was just executed. If it's 0,
                    // // don't highlight anything (this usually means we are at
                    // // the beginning of the script).
                    // if (step.line == 0) {
                    //     unhighlightAll(editor);
                    // } else {
                    //     highlightLine(editor, step.line);
                    // }
                } else {
                    clearInterval(this.replayTicker!);
                    this.replayTicker = null;
                    switch (outcome) {
                        case "success":
                            alert("You win!");
                            break;
                        case "failure":
                            alert("You lose!");
                            break;
                        case "continue":
                            alert(
                                "Your code ran without any errors but you didn't finish the objective. Try again!"
                            );
                            break;
                    }
                }
                stepIndex += 1;
            }, MS_PER_STEP);
        },
    }
};

function emptyLineState(state: State): StateWithPos {
    return {
        state,
        line: 0,
        col: 0,
    };
}
</script>

<template>
    <div>
        <div class="2xl:container 2xl:mx-auto my-4">
            <div class="flex flex-row px-4">
                <!-- Editor and control pannel -->
                <div class="flex w-full flex-col">
                    <!-- TODO(albrow): Move control panel to separate template? -->
                    <!-- Control panel -->
                    <div class="grid grid-flow-col bg-gray-800 rounded-t-md p-2">
                        <!-- Left aligned buttons -->
                        <div class="flex justify-start justify-self-start gap-2">
                            <button @click="runScript"
                                class="bg-emerald-500 active:bg-emerald-600 rounded p-1 px-3 font-semibold">
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
                    <!-- Editor -->
                    <div id="player-script" name="player-script">
                        <Editor :initialCode="currentCode" @code-change="handleCodeChange" />
                    </div>
                </div>
                <!-- Game board -->
                <div class="px-4">
                    <div id="board-wrapper" class="relative">
                        <Board :width="width" :height="height" :game-state="currentState.state" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
