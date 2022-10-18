import { useParams } from "react-router-dom";

import Board from "../components/board/board";
import Editor from "../components/editor/editor";

export default function Level() {
  const { levelNumber } = useParams();

  return (
    <div className="2xl:container 2xl:mx-auto my-4">
      <div className="flex flex-row px-4">
        <div className="flex w-full flex-col">
          {/* TODO(albrow): Move control panel to separate template? */}
          <div className="grid grid-flow-col bg-gray-800 rounded-t-md p-2">
            <div className="flex justify-start justify-self-start gap-2">
              <button className="bg-emerald-500 active:bg-emerald-600 rounded p-1 px-3 font-semibold">
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
          <Editor />
        </div>
        <div className="px-4">
          <div id="board-wrapper" className="relative">
            <Board />
          </div>
        </div>
      </div>
    </div>
  );
}
