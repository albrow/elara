<script lang="ts">
import * as PIXI from "pixi.js";
import { StateWithPos } from "../../battle-game-lib/pkg";

const WIDTH = 12;
const HEIGHT = 8;
const TILE_SIZE = 50;
const CANVAS_WIDTH = (TILE_SIZE + 1) * WIDTH + 1;
const CANVAS_HEIGHT = (TILE_SIZE + 1) * HEIGHT + 1;
const GRID_COLOR = 0x000000;
const BACKGROUND_COLOR = 0xcccccc;
const PLAYER_SPRITE_Z_INDEX = 200;
const FUEL_SPRITE_Z_INDEX = 100;

export default {
    data() {
        return {
            gameState: StateWithPos.new(),
            fuelSprites: [] as PIXI.Sprite[],
        };
    },
    setup() {
        // Create the application helper and add its render target to the page
        const app = new PIXI.Application({
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: BACKGROUND_COLOR,
        });

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

        return {
            app,
            playerSprite,
        }
    },
    mounted() {
        document.querySelector("#board")!.appendChild(this.app.view);
    },
    drawSprites() {
        const gameState = this.gameState.state;
        const playerSprite = this.playerSprite;
        const fuelSprites = this.fuelSprites;

        playerSprite.x = gameState.player.pos.x * (TILE_SIZE + 1) + 1;
        playerSprite.y = gameState.player.pos.y * (TILE_SIZE + 1) + 1;

        // For performance, we keep an array of fuel sprites for
        // re-use. We add or remove sprites from this list depending
        // on the current state.
        if (fuelSprites.length > gameState.fuel.length) {
            const sprite = fuelSprites.pop();
            if (sprite) {
                // TODO(albrow): See if we can remove this ts-ignore comment.
                // @ts-ignore
                this.app.stage.removeChild(sprite);
            }
        } else if (fuelSprites.length < gameState.fuel.length) {
            const sprite = PIXI.Sprite.from("/images/fuel.png");
            sprite.height = TILE_SIZE;
            sprite.width = TILE_SIZE;
            sprite.zIndex = FUEL_SPRITE_Z_INDEX;
            this.app.stage.addChild(sprite);
            fuelSprites.push(sprite);
        }
        for (let i = 0; i < gameState.fuel.length; i++) {
            const fuelState = gameState.fuel[i];
            const sprite = fuelSprites[i];
            sprite.x = fuelState.pos.x * (TILE_SIZE + 1) + 1;
            sprite.y = fuelState.pos.y * (TILE_SIZE + 1) + 1;
        }
    }
};

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
</script>

<template>
    <div id="board"></div>
</template>
