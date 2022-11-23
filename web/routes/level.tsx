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
import { MdPlayArrow, MdStop } from "react-icons/md";

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

const GAME_SPEED = 1; // steps per second
const MS_PER_STEP = 1000 / GAME_SPEED;

const game = Game.new();
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
  const [replaySteps, setReplaySteps] = useState<readonly FuzzyStateWithLine[]>(
    []
  );
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
    setReplaySteps([]);
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
    setReplaySteps(result.states);
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
        if (step.line_pos) {
          setActiveLine(step.line_pos);
        } else {
          setActiveLine(undefined);
        }
      } else {
        // There are no more steps to iterate through, display the outcome.
        switch (lastOutcome) {
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
            alert(lastOutcome);
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
                  <MdStop size={"1.3em"} style={{ marginRight: "0.1rem" }} />{" "}
                  Stop
                </Button>
              )}
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
