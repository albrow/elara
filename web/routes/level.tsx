import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Flex,
  Text,
  Box,
  Button,
  Link,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import {
  MdPause,
  MdPlayArrow,
  MdSkipNext,
  MdSkipPrevious,
  MdStop,
} from "react-icons/md";

import {
  Game,
  LevelData,
  RhaiError,
  RunResult,
  FuzzyStateWithLine,
  LinePos,
} from "../../elara-lib/pkg";
import Board from "../components/board/board";
import Editor, { CodeError } from "../components/editor/editor";
import { saveCode, loadCode } from "../lib/storage";
import { sections, SectionName } from "../components/journal/journal_section";
import JournalModal from "../components/journal/journal_modal";
import { Replayer } from "../lib/replayer";

const game = Game.new();
let replayer: Replayer | null = null;

export default function Level() {
  const { levelNumber } = useParams();
  if (!levelNumber) {
    throw new Error("levelNumber is required");
  }
  const levelIndex = parseInt(levelNumber, 10) - 1;
  const level = game.get_level_data(levelIndex);
  const [code, setCode] = useState(level.initial_code);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [boardState, setBoardState] = useState(level.initial_state);
  const [activeLine, setActiveLine] = useState<LinePos | undefined>(undefined);
  const [codeError, setCodeError] = useState<CodeError | undefined>(undefined);
  const [journalVisible, setJournalVisible] = useState(false);
  const [journalSection, setJournalSection] = useState(
    Object.keys(sections)[0] as SectionName
  );

  const onCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setCodeError(undefined);
  }, []);

  const resetStateButKeepCode = (levelOverride?: LevelData) => {
    const levelToLoad = levelOverride || level;
    setIsRunning(false);
    setIsPaused(false);
    if (replayer) {
      replayer.stop();
    }
    setActiveLine(undefined);
    setCodeError(undefined);
    setBoardState(levelToLoad.initial_state);
  };

  // Reset the relevant state when the URL changes.
  const location = useLocation();
  useEffect(() => {
    const levelIndex = parseInt(levelNumber, 10) - 1;
    const level = game.get_level_data(levelIndex);
    resetStateButKeepCode(level);
    setCode(level.initial_code);
  }, [location]);

  const onStepHandler = (step: FuzzyStateWithLine) => {
    setBoardState(step.state);
    if (step.line_pos) {
      setActiveLine(step.line_pos);
    } else {
      setActiveLine(undefined);
    }
  };

  const onReplayDoneHandler = (result: RunResult) => {
    return () => {
      // There are no more steps to iterate through, display the outcome.
      switch (result.outcome) {
        case "no_objective":
          // Do nothing. Used for levels without any specific objective.
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
    };
  };

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
    setBoardState(result.states[0].state);
    setIsRunning(true);
    replayer = new Replayer(
      result.states,
      onStepHandler,
      onReplayDoneHandler(result)
    );
    replayer.start();
  };

  const stopHandler = () => {
    resetStateButKeepCode();
  };

  const pauseHandler = () => {
    if (replayer) {
      replayer.pause();
      setIsPaused(true);
    }
  };

  const stepForwardHandler = () => {
    if (replayer) {
      replayer.stepForward();
    }
  };

  const stepBackHandler = () => {
    if (replayer) {
      replayer.stepBackward();
    }
  };

  const resumeHandler = () => {
    if (replayer) {
      replayer.start();
      setIsPaused(false);
    }
  };

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
    <>
      <JournalModal
        visible={journalVisible}
        section={journalSection}
        setVisible={setJournalVisible}
      />
      <Container maxW="container.xl" mt={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={1}>
            Level {levelNumber}: {level.name}
          </Text>
          <Box hidden={level.new_core_concepts.length == 0}>
            <b>Key Concepts:</b>
            <UnorderedList>
              {level.new_core_concepts.map((concept) => (
                <ListItem key={concept} ml={2}>
                  <Link
                    fontWeight={"semibold"}
                    color={"blue.500"}
                    onClick={() => {
                      setJournalSection(concept);
                      setJournalVisible(true);
                    }}
                  >
                    {concept}
                  </Link>
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
          <p>
            <b>Objective:</b> {level.objective}
          </p>
        </Box>
        <Flex direction="row" mt={4}>
          <Box id="editor-section" mr={2} flexGrow={1}>
            <Box bg="gray.800" p={2} roundedTop="md">
              <Flex direction="row">
                <Box>
                  {!isRunning && (
                    <Button size="sm" colorScheme="green" onClick={runHandler}>
                      <MdPlayArrow
                        size={"1.3em"}
                        style={{ marginRight: "0.1rem" }}
                      />{" "}
                      Run
                    </Button>
                  )}
                  {isRunning && (
                    <Button size="sm" colorScheme="red" onClick={stopHandler}>
                      <MdStop
                        size={"1.3em"}
                        style={{ marginRight: "0.1rem" }}
                      />{" "}
                      Stop
                    </Button>
                  )}
                </Box>
                <Box ml={2}>
                  {isRunning && (
                    <Button
                      size="sm"
                      colorScheme="whiteAlpha"
                      ml={1}
                      onClick={stepBackHandler}
                    >
                      <MdSkipPrevious size={"1.3em"} />
                    </Button>
                  )}
                  {isRunning && !isPaused && (
                    <Button
                      size="sm"
                      colorScheme="whiteAlpha"
                      ml={1}
                      onClick={pauseHandler}
                    >
                      <MdPause size={"1.3em"} />
                    </Button>
                  )}
                  {isRunning && isPaused && (
                    <Button
                      size="sm"
                      colorScheme="whiteAlpha"
                      ml={1}
                      onClick={resumeHandler}
                    >
                      <MdPlayArrow size={"1.3em"} />
                    </Button>
                  )}
                  {isRunning && (
                    <Button
                      size="sm"
                      colorScheme="whiteAlpha"
                      ml={1}
                      onClick={stepForwardHandler}
                    >
                      <MdSkipNext size={"1.3em"} />
                    </Button>
                  )}
                </Box>
              </Flex>
            </Box>
            <Editor
              code={code}
              editable={!isRunning}
              onChange={onCodeChange}
              activeLine={activeLine}
              codeError={codeError}
            />
          </Box>
          <Box id="board-wrapper" position="relative">
            <Board gameState={boardState} />
          </Box>
        </Flex>
      </Container>
    </>
  );
}
