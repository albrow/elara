import { useParams } from "react-router-dom";
import { useState, useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

import { Game } from "../../battle-game-lib/pkg";
import { WIDTH, HEIGHT } from "../lib/constants";
import {
  rustToJsState,
  StateWithLine,
  emptyLineState,
  rustToJsStateWithLine,
} from "../lib/state";
import Board from "../components/board/board";
import Editor from "../components/editor/editor";

const GAME_SPEED = 1; // steps per second
const MS_PER_STEP = 1000 / GAME_SPEED;

const game = Game.new(WIDTH, HEIGHT);
let replayTimerId: number | null = null;

export default function Level() {
  const { levelNumber } = useParams();
  if (!levelNumber) {
    throw new Error("levelNumber is required");
  }
  const levelIndex = parseInt(levelNumber, 10) - 1;
  const level = game.get_level_data(levelIndex);
  const [code, setCode] = useState(level.initial_code);
  const [isRunning, setIsRunning] = useState(false);
  const [lastOutcome, setOutcome] = useState("continue");
  const [replaySteps, setReplaySteps] = useState<readonly StateWithLine[]>([]);
  const [boardState, setBoardState] = useState(
    rustToJsState(level.initial_state)
  );

  // Reset the relevant state when the URL changes.
  const location = useLocation();
  useEffect(() => {
    console.log("Detected location change");
    console.log("Current level number is " + levelNumber);
    setIsRunning(false);
    const levelIndex = parseInt(levelNumber, 10) - 1;
    const level = game.get_level_data(levelIndex);
    setCode(level.initial_code);
    setReplaySteps([]);
    setBoardState(rustToJsState(level.initial_state));
  }, [location]);

  // When the run button is clicked, run the code and start the replay.
  const runHandler = async () => {
    const result = await game.run_player_script(code, levelIndex);
    setOutcome(result.outcome);
    setReplaySteps(result.states.map(rustToJsStateWithLine));
    setBoardState(result.states[0].state);
    setIsRunning(true);
  };

  const stopHandler = () => {
    setIsRunning(false);
    setReplaySteps([]);
    setBoardState(rustToJsState(level.initial_state));
  };

  // Timer used for replays.
  useEffect(() => {
    // Reset any existing timer.
    if (replayTimerId) {
      clearInterval(replayTimerId);
    }
    // If the code is not running, don't do anything.
    if (!isRunning) {
      return;
    }
    // If the code is running, iterate through the steps, starting at 1
    // because the initial state is already being shown.
    let stepIndex = 1;
    replayTimerId = setInterval(() => {
      if (stepIndex < replaySteps.length) {
        setBoardState(replaySteps[stepIndex].state);
        stepIndex += 1;
        // TODO(albrow): Implement this.
        // Highlight the line that was just executed. If it's 0,
        // don't highlight anything (this usually means we are at
        // the beginning of the script).
        // if (step.line == 0) {
        //   unhighlightAll(editor);
        // } else {
        //   highlightLine(editor, step.line);
        // }
      } else {
        // There are no more steps to iterate through, display the outcome.
        switch (lastOutcome) {
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
        // Stop the timer.
        if (replayTimerId) {
          clearInterval(replayTimerId);
        }
        setIsRunning(false);
      }
    }, MS_PER_STEP);
    return () => {
      // When the component unmounts, reset the timer.
      if (replayTimerId) {
        clearInterval(replayTimerId);
      }
    };
  }, [isRunning]);

  return (
    <div className="2xl:container 2xl:mx-auto my-4">
      <div className="flex flex-row px-4">
        <div className="flex w-full flex-col">
          {/* TODO(albrow): Move control panel to separate template? */}
          <div className="grid grid-flow-col bg-gray-800 rounded-t-md p-2">
            <div className="flex justify-start justify-self-start gap-2">
              {!isRunning && (
                <button
                  onClick={runHandler}
                  className="bg-emerald-500 active:bg-emerald-600 rounded p-1 px-3 font-semibold"
                >
                  ▶ Run
                </button>
              )}
              {isRunning && (
                <button
                  onClick={stopHandler}
                  className="bg-red-500 active:bg-red-700 rounded p-1 px-3 font-semibold"
                >
                  ◾️ Stop
                </button>
              )}
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
          <Editor
            code={code}
            editable={!isRunning}
            onChange={(code: string) => setCode(code)}
          />
        </div>
        <div className="px-4">
          <div id="board-wrapper" className="relative">
            <Board gameState={boardState} />
          </div>
        </div>
      </div>
    </div>
  );
}
