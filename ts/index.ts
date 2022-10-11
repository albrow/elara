// @ts-ignore
import { default as wasmbin } from "../pkg/battle_game_bg.wasm";
import init, { Game, RhaiError, State, RunResult } from "../pkg/battle_game";
import * as PIXI from "pixi.js";
import * as editorVew from "./editor";
import { setDiagnostics } from "./editor";
import { highlightLine, unhighlightAll } from "./highlight_line";
import { loadScript, saveScript } from "./storage";

(async function () {
  await init(wasmbin);
  const editor = editorVew.init();

  const WIDTH = 12;
  const HEIGHT = 8;
  const TILE_SIZE = 50;
  const CANVAS_WIDTH = (TILE_SIZE + 1) * WIDTH + 1;
  const CANVAS_HEIGHT = (TILE_SIZE + 1) * HEIGHT + 1;
  const GRID_COLOR = 0x000000;
  const BACKGROUND_COLOR = 0xcccccc;
  const GAME_SPEED = 1; // steps per second
  const MS_PER_STEP = 1000 / GAME_SPEED;
  const PLAYER_SPRITE_Z_INDEX = 200;
  const FUEL_SPRITE_Z_INDEX = 100;

  // Create the application helper and add its render target to the page
  const app = new PIXI.Application({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: BACKGROUND_COLOR,
  });
  document.querySelector("#board").appendChild(app.view);

  // Setting sortableChildren allows us to use zIndex to control
  // which sprites on drawn on top.
  app.stage.sortableChildren = true;

  // Draw grid lines.
  const grid_graphics = new PIXI.Graphics();
  drawGrid(grid_graphics);
  app.stage.addChild(grid_graphics);

  // Create the player sprite and add it to the stage.
  const playerSprite = PIXI.Sprite.from("/images/robot.png");
  playerSprite.height = TILE_SIZE;
  playerSprite.width = TILE_SIZE;
  playerSprite.zIndex = PLAYER_SPRITE_Z_INDEX;
  app.stage.addChild(playerSprite);

  // Create a placeholder array for fuel sprites. This will
  // grow or shrink as needed.
  let fuelSprites: PIXI.Sprite[] = [];

  // Determine the initial level to load from the URL.
  const levelNumber = getOrSetLevelFromUrl();

  // Create the game and load the level.
  const game = Game.new(WIDTH, HEIGHT);
  game.load_level(levelNumber);
  drawSprites(game.initial_state());
  editor.dispatch(
    editor.state.update({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: game.initial_code(),
      },
    })
  );
  document.querySelector("#objective").innerHTML = game.curr_level_objective();

  // Event listeners.
  document
    .querySelector("#run-button")
    .addEventListener("click", runScriptHandler);
  document
    .querySelector("#load-button")
    .addEventListener("click", loadScriptHandler);
  document
    .querySelector("#save-button")
    .addEventListener("click", saveScriptHandler);
  document.addEventListener("keydown", async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      // Save on Ctrl + S or Cmd + S
      await saveScriptHandler();
      event.preventDefault();
      return false;
    }
    // Run the script on Shift + Enter
    if (event.shiftKey && event.key === "Enter") {
      await runScriptHandler();
      event.preventDefault();
      return false;
    }
  });
  document.querySelector("#objective-hide").addEventListener("click", () => {
    document.querySelector("#objective").classList.add("hidden");
    document.querySelector("#objective-prefix").classList.add("hidden");
    document.querySelector("#objective-hide").classList.add("hidden");
    document.querySelector("#objective-show").classList.remove("hidden");
  });
  document.querySelector("#objective-show").addEventListener("click", () => {
    document.querySelector("#objective").classList.remove("hidden");
    document.querySelector("#objective-prefix").classList.remove("hidden");
    document.querySelector("#objective-hide").classList.remove("hidden");
    document.querySelector("#objective-show").classList.add("hidden");
  });

  async function saveScriptHandler() {
    const script = editor.state.doc.toString();
    await saveScript(script);
  }

  async function loadScriptHandler() {
    const script = await loadScript();
    editor.dispatch(
      editor.state.update({
        changes: { from: 0, to: editor.state.doc.length, insert: script },
      })
    );
  }

  // TODO(albrow): Disallow editing the script while it is running.
  // TODO(albrow): Add stop and reset buttons.
  let animationTicker: PIXI.Ticker = null;
  async function runScriptHandler() {
    // Reset game state and ticker.
    game.reset();
    if (animationTicker) {
      animationTicker.stop();
    }
    drawSprites(game.initial_state());

    // Remove any error messages from the editor.
    editor.dispatch(setDiagnostics(editor.state, []));

    // Run the simulation.
    const script = editor.state.doc.toString();
    let runResult: RunResult;
    try {
      runResult = (await game.run_player_script(
        script
      )) as unknown as RunResult;
    } catch (e) {
      // If there is an error, display it in the editor.
      if (e instanceof RhaiError) {
        console.log(`${e.message}`);

        // In Rhai, positions are composed of (line, column), but
        // CodeMirror wants the absolute position. We need to do
        // some math to convert between the two.
        const line = editor.viewportLineBlocks[e.line - 1];
        // start is the absolute position where the error
        // first occurred, but we still need to get a range.
        let start = line.from + e.col;
        // Use wordAt to get a range encapsulating the "word" that
        // caused the error.
        let range = editor.state.wordAt(start);
        while (range === null) {
          // If wordAt returns null, it means that the error occurred
          // on a non-word character. In this case, we can just
          // decrement the position and try again to find the closest
          // word.
          start -= 1;
          range = editor.state.wordAt(start);
        }

        editor.dispatch(
          setDiagnostics(editor.state, [
            {
              from: range.from,
              to: range.to,
              message: e.message,
              severity: "error",
            },
          ])
        );
        return;
      } else {
        throw e;
      }
    }

    // Step through the replay at GAME_SPEED.
    let elapsed = 0;
    let states = runResult.states;
    let tickerHandler = () => {
      // TODO(albrow): Scroll the editor window to make sure the currently running
      // line is visible.
      // See: https://stackoverflow.com/questions/10575343/
      elapsed += app.ticker.elapsedMS;
      const stepIndex = Math.floor(elapsed / MS_PER_STEP);
      if (stepIndex < states.length) {
        let step = states[stepIndex];
        drawSprites(step.state);

        // Highlight the line that was just executed. If it's 0,
        // don't highlight anything (this usually means we are at
        // the beginning of the script).
        if (step.line == 0) {
          unhighlightAll(editor);
        } else {
          highlightLine(editor, step.line);
        }
      } else {
        switch (runResult.outcome) {
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
        animationTicker.stop();
        animationTicker.remove(tickerHandler);
      }
    };
    animationTicker = app.ticker.add(tickerHandler);
    animationTicker.start();
  }

  // Helper function to draw the grid lines.
  function drawGrid(graphics: PIXI.Graphics) {
    graphics.beginFill(GRID_COLOR);

    // Vertical lines.
    for (let i = 0; i <= WIDTH; i++) {
      graphics.drawRect(i * (TILE_SIZE + 1), 0, 1, CANVAS_HEIGHT);
    }

    // Horizontal lines.
    for (let i = 0; i <= HEIGHT; i++) {
      graphics.drawRect(0, i * (TILE_SIZE + 1), CANVAS_WIDTH, 1);
    }

    graphics.endFill();
  }

  function drawSprites(state: State) {
    playerSprite.x = state.player.pos.x * (TILE_SIZE + 1) + 1;
    playerSprite.y = state.player.pos.y * (TILE_SIZE + 1) + 1;

    // For performance, we keep an array of fuel sprites for
    // re-use. We add or remove sprites from this list depending
    // on the current state.
    if (fuelSprites.length > state.fuel.length) {
      const sprite = fuelSprites.pop();
      app.stage.removeChild(sprite);
    } else if (fuelSprites.length < state.fuel.length) {
      const sprite = PIXI.Sprite.from("/images/fuel.png");
      sprite.height = TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.zIndex = FUEL_SPRITE_Z_INDEX;
      app.stage.addChild(sprite);
      fuelSprites.push(sprite);
    }
    for (let i = 0; i < state.fuel.length; i++) {
      const fuelState = state.fuel[i];
      const sprite = fuelSprites[i];
      sprite.x = fuelState.pos.x * (TILE_SIZE + 1) + 1;
      sprite.y = fuelState.pos.y * (TILE_SIZE + 1) + 1;
    }
  }
})();

// Get the current level from the hash of the URL,
// or default to 1.
function getOrSetLevelFromUrl(): number {
  const hash = window.location.hash;
  if (hash.length > 0) {
    const level = parseInt(hash.substring(1));
    if (!isNaN(level)) {
      // Level names are 1-indexed in the UI, but under the
      // hood they are 0-indexed.
      return level - 1;
    }
  }
  window.location.hash = "1";
  return 0;
}
