import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Flex,
  Text,
  Box,
  UnorderedList,
  ListItem,
  Button,
} from "@chakra-ui/react";

import {
  Game,
  LevelData,
  RhaiError,
  RunResult,
  FuzzyStateWithLine,
  LinePos,
  // eslint-disable-next-line camelcase
  get_level_data,
} from "../../elara-lib/pkg";
import Board from "../components/board/board";
import Editor, { CodeError } from "../components/editor/editor";
import { saveCode, loadCode } from "../lib/storage";
import { sections, SectionName } from "../components/journal/journal_section";
import JournalModal from "../components/journal/journal_modal";
import { Replayer } from "../lib/replayer";
import ControlBar from "../components/control_bar";
import ObjectiveText from "../components/objective_text";

const game = Game.new();
let replayer: Replayer | null = null;

const LEVELS: LevelData[] = get_level_data();

// A handler used to get the current code from the editor.
// Starts out unset, but will be set by the editor component.
let getCode: () => string;

export default function Level() {
  const { levelNumber } = useParams();
  const levelIndex = useCallback(() => {
    if (!levelNumber) {
      throw new Error("levelNumber is required");
    }
    return parseInt(levelNumber, 10);
  }, [levelNumber]);

  const [code, setCode] = useState(LEVELS[levelIndex()].initial_code);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [boardState, setBoardState] = useState(
    LEVELS[levelIndex()].initial_state
  );
  const [activeLine, setActiveLine] = useState<LinePos | undefined>(undefined);
  const [codeError, setCodeError] = useState<CodeError | undefined>(undefined);
  const [journalVisible, setJournalVisible] = useState(false);
  const [journalSection, setJournalSection] = useState(
    Object.keys(sections)[0] as SectionName
  );

  const currLevel = useCallback(() => LEVELS[levelIndex()], [levelIndex]);

  useEffect(() => {
    document.title = `Elara | Level ${levelIndex()}: ${currLevel().name}`;
  }, [levelIndex, currLevel]);

  // Passed through to the Editor component to allow us
  // to get the current code from the editor in an efficient
  // way.
  const setGetCodeHandler = useCallback((handler: () => string) => {
    getCode = handler;
  }, []);

  const resetStateButKeepCode = useCallback(
    (levelOverride?: LevelData) => {
      const levelToLoad = levelOverride || currLevel();
      setIsRunning(false);
      setIsPaused(false);
      if (replayer) {
        replayer.stop();
      }
      setActiveLine(undefined);
      setCodeError(undefined);
      setBoardState(levelToLoad.initial_state);
    },
    [currLevel]
  );

  // Reset the relevant state when the URL changes.
  const location = useLocation();
  useEffect(() => {
    const level = LEVELS[levelIndex()];
    resetStateButKeepCode(level);
    setCode(level.initial_code);
  }, [location, levelIndex, resetStateButKeepCode]);

  const onStepHandler = (step: FuzzyStateWithLine) => {
    setBoardState(step.state);
    if (step.line_pos) {
      setActiveLine(step.line_pos);
    } else {
      setActiveLine(undefined);
    }
  };

  const onReplayDoneHandler = useCallback(
    (result: RunResult) => () => {
      // There are no more steps to iterate through, display the outcome.
      switch (result.outcome) {
        case "no_objective":
          alert(
            "Great! Keep playing around with the code as much as you like! Whenever you are " +
              "ready, you can move on to the next level."
          );
          break;
        case "success":
          alert("You win!");
          break;
        case "continue":
          alert(
            "Your code ran without any errors but you didn't finish the objective. Try again!"
          );
          break;
        default:
          alert(result.outcome);
          break;
      }
      resetStateButKeepCode();
    },
    [resetStateButKeepCode]
  );

  // When the run button is clicked, run the code and start the replay.
  const runHandler = useCallback(async () => {
    let result: RunResult;
    try {
      result = await game.run_player_script(getCode(), levelIndex());
    } catch (e) {
      // If there is an error, display it in the editor.
      if (e instanceof RhaiError) {
        console.warn(`Rhai Error detected: ${e.message}`);
        if (e.line) {
          setCodeError({
            line: e.line,
            col: e.col,
            message: e.message,
          });
        } else {
          alert(e.message);
        }

        return;
      }
      throw e;
    }
    resetStateButKeepCode();
    setBoardState(result.states[0].state);
    setIsRunning(true);
    replayer = new Replayer(
      result.states,
      onStepHandler,
      onReplayDoneHandler(result)
    );
    replayer.start();
  }, [resetStateButKeepCode, onReplayDoneHandler, levelIndex]);

  const stopHandler = useCallback(() => {
    resetStateButKeepCode();
  }, [resetStateButKeepCode]);

  const pauseHandler = useCallback(() => {
    if (replayer) {
      replayer.pause();
      setIsPaused(true);
    }
  }, []);

  const stepForwardHandler = useCallback(() => {
    if (replayer) {
      replayer.stepForward();
    }
  }, []);

  const stepBackHandler = useCallback(() => {
    if (replayer) {
      replayer.stepBackward();
    }
  }, []);

  const resumeHandler = useCallback(() => {
    if (replayer) {
      replayer.start();
      setIsPaused(false);
    }
  }, []);

  const saveCodeHandler = useCallback(async () => {
    await saveCode(getCode());
  }, []);

  const loadCodeHandler = useCallback(async () => {
    const loadedCode = await loadCode();
    setCode(loadedCode);
  }, []);

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
      return Promise.resolve();
    };
    document.addEventListener("keydown", keyListener);
    return () => {
      document.removeEventListener("keydown", keyListener);
    };
  }, [isRunning, runHandler, saveCodeHandler, stopHandler]);

  return (
    <>
      <JournalModal
        visible={journalVisible}
        section={journalSection}
        setVisible={setJournalVisible}
      />
      <Container maxW="container.xl" mt={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={1}>
            Level {levelNumber}: {currLevel().name}
          </Text>
          <Box hidden={currLevel().new_core_concepts.length === 0}>
            <b>Key Concepts:</b>
            <UnorderedList>
              {currLevel().new_core_concepts.map((concept) => (
                <ListItem key={concept} ml={2}>
                  <Button
                    fontWeight="semibold"
                    color="blue.500"
                    onClick={() => {
                      setJournalSection(concept);
                      setJournalVisible(true);
                    }}
                  >
                    {concept}
                  </Button>
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
          <p>
            <b>Objective:</b> <ObjectiveText text={currLevel().objective} />
          </p>
        </Box>
        <Flex direction="row" mt={4}>
          <Box id="editor-section" mr={2} flexGrow={1}>
            <ControlBar
              isRunning={isRunning}
              isPaused={isPaused}
              runHandler={runHandler}
              stopHandler={stopHandler}
              pauseHandler={pauseHandler}
              stepForwardHandler={stepForwardHandler}
              stepBackHandler={stepBackHandler}
              resumeHandler={resumeHandler}
              saveCodeHandler={saveCodeHandler}
              loadCodeHandler={loadCodeHandler}
            />
            <Box w="608px">
              <Editor
                code={code}
                editable={!isRunning}
                setGetCodeHandler={setGetCodeHandler}
                activeLine={activeLine}
                codeError={codeError}
              />
            </Box>
          </Box>
          <Box id="board-wrapper" position="relative">
            <Board gameState={boardState} />
          </Box>
        </Flex>
      </Container>
    </>
  );
}
