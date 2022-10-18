import init, {
  Game,
  RhaiError,
  State,
  RunResult,
} from "../battle-game-lib/pkg";
import * as Vue from "vue";
import App from "./App.vue";

import { router } from "./lib/router";
import VueCodemirror from "vue-codemirror";

(async function () {
  await init();

  const vueApp = Vue.createApp(App);
  vueApp.use(router);
  vueApp.use(VueCodemirror, {
    extensions: [],
  });
  vueApp.mount("#app");

  // // Determine the initial level to load from the URL.
  // const levelNumber = getOrSetLevelFromUrl();

  // Create the game and load the level.
  // const game = Game.new(WIDTH, HEIGHT);
  // game.load_level(0);
  // drawSprites(game.initial_state());
  // editor.dispatch(
  //   editor.state.update({
  //     changes: {
  //       from: 0,
  //       to: editor.state.doc.length,
  //       insert: game.initial_code(),
  //     },
  //   })
  // );
  // document.querySelector("#objective").innerHTML = game.curr_level_objective();
  // // Event listeners.
  // document
  //   .querySelector("#run-button")
  //   .addEventListener("click", runScriptHandler);
  // document
  //   .querySelector("#load-button")
  //   .addEventListener("click", loadScriptHandler);
  // document
  //   .querySelector("#save-button")
  //   .addEventListener("click", saveScriptHandler);
  // document.addEventListener("keydown", async (event) => {
  //   if ((event.ctrlKey || event.metaKey) && event.key === "s") {
  //     // Save on Ctrl + S or Cmd + S
  //     await saveScriptHandler();
  //     event.preventDefault();
  //     return false;
  //   }
  //   // Run the script on Shift + Enter
  //   if (event.shiftKey && event.key === "Enter") {
  //     await runScriptHandler();
  //     event.preventDefault();
  //     return false;
  //   }
  // });
  // document.querySelector("#objective-hide").addEventListener("click", () => {
  //   document.querySelector("#objective").classList.add("hidden");
  //   document.querySelector("#objective-prefix").classList.add("hidden");
  //   document.querySelector("#objective-hide").classList.add("hidden");
  //   document.querySelector("#objective-show").classList.remove("hidden");
  // });
  // document.querySelector("#objective-show").addEventListener("click", () => {
  //   document.querySelector("#objective").classList.remove("hidden");
  //   document.querySelector("#objective-prefix").classList.remove("hidden");
  //   document.querySelector("#objective-hide").classList.remove("hidden");
  //   document.querySelector("#objective-show").classList.add("hidden");
  // });
  // async function saveScriptHandler() {
  //   const script = editor.state.doc.toString();
  //   await saveScript(script);
  // }
  // async function loadScriptHandler() {
  //   const script = await loadScript();
  //   editor.dispatch(
  //     editor.state.update({
  //       changes: { from: 0, to: editor.state.doc.length, insert: script },
  //     })
  //   );
  // }
  // TODO(albrow): Disallow editing the script while it is running.
  // TODO(albrow): Add stop and reset buttons.

  // Helper function to draw the grid lines.
})();
