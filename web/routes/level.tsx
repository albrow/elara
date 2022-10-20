import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

import {
  Game,
  LevelData,
  RhaiError,
  RunResult,
} from "../../battle-game-lib/pkg";
import { WIDTH, HEIGHT } from "../lib/constants";
import {
  rustToJsState,
  StateWithLine,
  rustToJsStateWithLine,
  LinePos,
} from "../lib/state";
import Board from "../components/board/board";
import Editor, { CodeError } from "../components/editor/editor";
import { saveCode, loadCode } from "../lib/storage";

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
  const [activeLine, setActiveLine] = useState<LinePos | undefined>(undefined);
  const [codeError, setCodeError] = useState<CodeError | undefined>(undefined);

  const onCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setCodeError(undefined);
  }, []);

  const resetStateButKeepCode = (levelOverride?: LevelData) => {
    const levelToLoad = levelOverride || level;
    setIsRunning(false);
    setReplaySteps([]);
    setActiveLine(undefined);
    setCodeError(undefined);
    setBoardState(rustToJsState(levelToLoad.initial_state));
  };

  // Reset the relevant state when the URL changes.
  const location = useLocation();
  useEffect(() => {
    const levelIndex = parseInt(levelNumber, 10) - 1;
    const level = game.get_level_data(levelIndex);
    resetStateButKeepCode(level);
    setCode(level.initial_code);
  }, [location]);

  // When the run button is clicked, run the code and start the replay.
  const runHandler = async () => {
    let result: RunResult;
    try {
      result = await game.run_player_script(code, levelIndex);
    } catch (e) {
      // If there is an error, display it in the editor.
      if (e instanceof RhaiError) {
        console.warn(`Rhai Error detected: ${e.message}`);
        setCodeError({
          line: e.line,
          col: e.col,
          message: e.message,
        });
        return;
      } else {
        throw e;
      }
    }
    resetStateButKeepCode();
    setOutcome(result.outcome);
    setReplaySteps(result.states.map(rustToJsStateWithLine));
    setBoardState(result.states[0].state);
    setIsRunning(true);
  };

  const stopHandler = () => {
    resetStateButKeepCode();
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
        const step = replaySteps[stepIndex];
        setBoardState(step.state);
        stepIndex += 1;

        // Highlight the line that was just executed (if any).
        if (step.linePos) {
          setActiveLine(step.linePos);
        } else {
          setActiveLine(undefined);
        }
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
        resetStateButKeepCode();
      }
    }, MS_PER_STEP);
    return () => {
      // When the component unmounts, reset the timer.
      if (replayTimerId) {
        clearInterval(replayTimerId);
      }
    };
  }, [isRunning]);

  const saveCodeHandler = async () => {
    await saveCode(code);
  };

  const loadCodeHandler = async () => {
    const loadedCode = await loadCode();
    setCode(loadedCode);
  };

  useEffect(() => {
    const keyListener = async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        // Save on Ctrl + S or Cmd + S
        await saveCodeHandler();
        event.preventDefault();
        return false;
      }
      // Run the script on Shift + Enter
      if (event.shiftKey && event.key === "Enter" && !isRunning) {
        await runHandler();
        event.preventDefault();
        return false;
      }
      // Stop running the script on Escape.
      if (event.key === "Escape" && isRunning) {
        stopHandler();
        event.preventDefault();
        return false;
      }
    };
    document.addEventListener("keydown", keyListener);
    return () => {
      document.removeEventListener("keydown", keyListener);
    };
  });

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
                onClick={saveCodeHandler}
                disabled={isRunning}
                className="bg-gray-300 rounded p-1 px-3 font-semibold disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={loadCodeHandler}
                disabled={isRunning}
                className="bg-gray-300 rounded p-1 px-3 font-semibold disabled:cursor-not-allowed"
              >
                Load
              </button>
            </div>
          </div>
          <Editor
            code={code}
            editable={!isRunning}
            onChange={onCodeChange}
            activeLine={activeLine}
            codeError={codeError}
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