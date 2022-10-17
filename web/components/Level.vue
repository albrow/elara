<script lang="ts">
import { ref, Ref } from "vue";

import {
    Game,
    RhaiError,
    RunResult,
} from "../../battle-game-lib/pkg";

import Board from "./Board.vue";
import Editor from "./Editor.vue";
import { WIDTH, HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT } from "../lib/constants";
import { rustToJsState, rustToJsStateWithPos, State, StateWithPos } from "../lib/state";

const GAME_SPEED = 1; // steps per second
const MS_PER_STEP = 1000 / GAME_SPEED;
const BACKGROUND_COLOR = 0xcccccc;


export default {
    components: {
        Board,
        Editor,
    },
    setup() {
        // Create the game and load the level.
        const game = Game.new(WIDTH, HEIGHT);
        game.load_level(0);
        const initialState = rustToJsState(game.initial_state());
        const initialCode = game.initial_code();

        return {
            game,
            stateWithLine: emptyLineState(initialState),
            initialCode,
        };
    },
    data() {
        return {
            width: WIDTH,
            height: HEIGHT,
            levelNumber: Number(this.$route.params.levelNumber),
            currentCode: ref((this.initialCode as unknown) as string),
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
            this.stateWithLine = emptyLineState(initialState);
            this.initialCode = this.game.initial_code();
        },
        async runScript() {
            // Reset game state and ticker.
            this.game.reset();
            // if (animationTicker) {
            //     animationTicker.stop();
            // }
            this.stateWithLine = emptyLineState(this.game.initial_state());
            // Remove any error messages from the editor.
            // editor.dispatch(setDiagnostics(editor.state, []));
            // Run the simulation.
            // const script = editor.state.doc.toString();
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

            // Step through the replay at GAME_SPEED.
            // TODO(albrow): If we can figure out a different way to drive this ticker,
            // we may be able to avoid initializing PIXI.Application here and do it in
            // the Board component instead.
            // let elapsed = 0;
            // let states = runResult.states.map(rustToJsStateWithPos);
            // console.log(states);
            // let tickerHandler = () => {
            //     // TODO(albrow): Scroll the editor window to make sure the currently running
            //     // line is visible.
            //     // See: https://stackoverflow.com/questions/10575343/
            //     elapsed += this.app.ticker.elapsedMS;
            //     const stepIndex = Math.floor(elapsed / MS_PER_STEP);
            //     if (stepIndex < states.length) {
            //         let step = states[stepIndex];
            //         console.log(step);
            //         this.stateWithLine = step;
            //         // console.log(`stepIndex: ${stepIndex}`)
            //         // console.log("step: ", step)

            //         // TODO(albrow): Re-implement this.
            //         //
            //         // // Highlight the line that was just executed. If it's 0,
            //         // // don't highlight anything (this usually means we are at
            //         // // the beginning of the script).
            //         // if (step.line == 0) {
            //         //     unhighlightAll(editor);
            //         // } else {
            //         //     highlightLine(editor, step.line);
            //         // }
            //     } else {
            //         switch (runResult.outcome) {
            //             case "success":
            //                 alert("You win!");
            //                 break;
            //             case "failure":
            //                 alert("You lose!");
            //                 break;
            //             case "continue":
            //                 alert(
            //                     "Your code ran without any errors but you didn't finish the objective. Try again!"
            //                 );
            //                 break;
            //         }
            //         animationTicker!.stop();
            //         animationTicker!.remove(tickerHandler);
            //     }
            // };
            // animationTicker = this.app.ticker.add(tickerHandler);
            // animationTicker!.start();
        }
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
                        <Editor :initialCode="initialCode" @code-change="handleCodeChange" />
                    </div>
                </div>
                <!-- Game board -->
                <div class="px-4">
                    <div id="board-wrapper" class="relative">
                        <Board :width="width" :height="height" :game-state="stateWithLine.state" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
