import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Game } from "../../battle-game-lib/pkg";
import { WIDTH, HEIGHT } from "../lib/constants";
import { rustToJsState } from "../lib/state";
import Board from "../components/board/board";
import Editor from "../components/editor/editor";

const game = Game.new(WIDTH, HEIGHT);

export default function Level() {
  const { levelNumber } = useParams();
  if (!levelNumber) {
    throw new Error("levelNumber is required");
  }
  const levelIndex = parseInt(levelNumber, 10) - 1;
  const level = game.get_level_data(levelIndex);
  const gameState = rustToJsState(level.initial_state);
  const [code, setCode] = useState(level.initial_code);

  // Whenever the location changes, we want to set the initial
  // code in the editor accordingly. This is necessary because
  // normally the editor is only updated when the user types
  // something.
  const location = useLocation();
  useEffect(() => {
    setCode(game.get_level_data(levelIndex).initial_code);
  }, [location]);

  return (
    <div className="2xl:container 2xl:mx-auto my-4">
      <div className="flex flex-row px-4">
        <div className="flex w-full flex-col">
          {/* TODO(albrow): Move control panel to separate template? */}
          <div className="grid grid-flow-col bg-gray-800 rounded-t-md p-2">
            <div className="flex justify-start justify-self-start gap-2">
              <button
                onClick={() => console.log(code)}
                className="bg-emerald-500 active:bg-emerald-600 rounded p-1 px-3 font-semibold"
              >
                ▶ Run
              </button>
            </div>
            <div className="flex justify-end justify-self-end gap-2">
              <button
                id="save-button"
                className="bg-gray-300 rounded p-1 px-3 font-semibold"
              >
                Save
              </button>
              <button
                id="load-button"
                className="bg-gray-300 rounded p-1 px-3 font-semibold"
              >
                Load
              </button>
            </div>
          </div>
          <Editor code={code} onChange={(code: string) => setCode(code)} />
        </div>
        <div className="px-4">
          <div id="board-wrapper" className="relative">
            <Board gameState={gameState} />
          </div>
        </div>
      </div>
    </div>
  );
}
