import { Game } from "battle-game-lib";
import * as PIXI from "pixi.js";

const WIDTH = 12;
const HEIGHT = 8;
const TILE_SIZE = 50;
const CANVAS_WIDTH = (TILE_SIZE + 1) * WIDTH + 1;
const CANVAS_HEIGHT = (TILE_SIZE + 1) * HEIGHT + 1;
const GRID_COLOR = 0x000000;
const BACKGROUND_COLOR = 0xcccccc;

// Create the application helper and add its render target to the page
const app = new PIXI.Application({
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: BACKGROUND_COLOR,
});
document.querySelector("#board").appendChild(app.view);

// Draw grid lines.
const grid_graphics = new PIXI.Graphics();
drawGrid(grid_graphics);
app.stage.addChild(grid_graphics);

// Create the player sprite and add it to the stage.
const sprite = PIXI.Sprite.from("/images/cat.png");
sprite.height = TILE_SIZE;
sprite.width = TILE_SIZE;
app.stage.addChild(sprite);

// Create the game and start it
const game = Game.new(WIDTH, HEIGHT);

// Temporary debugging. Pass a function and call it from Rust.
// game.set_player_behavior(`fn main() {"MOVE_RIGHT"}`);

// Event listeners.
// document.addEventListener("keydown", (event) => {
//   switch (event.key) {
//     case "ArrowRight":
//       game.step_forward();
//       drawSprites(game);
//       break;
//     case "ArrowLeft":
//       game.step_back();
//       drawSprites(game);
//       break;
//   }
// });
document.querySelector("#save-button").addEventListener("click", async () => {
  const script = (
    document.querySelector("#player-script") as HTMLTextAreaElement
  ).value;
  (document.querySelector("#save-button") as HTMLButtonElement).disabled = true;
  await game.run_player_script(script);
});

document.querySelector("#forward-button").addEventListener("click", () => {
  game.step_forward();
  drawSprites(game);
});

document.querySelector("#back-button").addEventListener("click", () => {
  game.step_back();
  drawSprites(game);
});

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

function drawSprites(game: Game) {
  const state = game.get_state();
  sprite.x = state.player.pos.x * (TILE_SIZE + 1) + 1;
  sprite.y = state.player.pos.y * (TILE_SIZE + 1) + 1;
}
