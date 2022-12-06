import { Flex, Box, Button } from "@chakra-ui/react";
import {
  MdPause,
  MdPlayArrow,
  MdSkipNext,
  MdSkipPrevious,
  MdStop,
} from "react-icons/md";

interface ControlBarProps {
  isRunning: boolean;
  isPaused: boolean;
  runHandler: () => void;
  stopHandler: () => void;
  stepBackHandler: () => void;
  pauseHandler: () => void;
  resumeHandler: () => void;
  stepForwardHandler: () => void;
}

export default function ControlBar(props: ControlBarProps) {
  return (
    <Box bg="gray.800" p={2} roundedTop="md">
      <Flex direction="row">
        <Box>
          {!props.isRunning && (
            <Button size="sm" colorScheme="green" onClick={props.runHandler}>
              <MdPlayArrow size={"1.3em"} style={{ marginRight: "0.1rem" }} />{" "}
              Run
            </Button>
          )}
          {props.isRunning && (
            <Button size="sm" colorScheme="red" onClick={props.stopHandler}>
              <MdStop size={"1.3em"} style={{ marginRight: "0.1rem" }} /> Stop
            </Button>
          )}
        </Box>
        <Box ml={2}>
          {props.isRunning && (
            <Button
              size="sm"
              colorScheme="whiteAlpha"
              ml={1}
              onClick={props.stepBackHandler}
            >
              <MdSkipPrevious size={"1.3em"} />
            </Button>
          )}
          {props.isRunning && !props.isPaused && (
            <Button
              size="sm"
              colorScheme="whiteAlpha"
              ml={1}
              onClick={props.pauseHandler}
            >
              <MdPause size={"1.3em"} />
            </Button>
          )}
          {props.isRunning && props.isPaused && (
            <Button
              size="sm"
              colorScheme="whiteAlpha"
              ml={1}
              onClick={props.resumeHandler}
            >
              <MdPlayArrow size={"1.3em"} />
            </Button>
          )}
          {props.isRunning && (
            <Button
              size="sm"
              colorScheme="whiteAlpha"
              ml={1}
              onClick={props.stepForwardHandler}
            >
              <MdSkipNext size={"1.3em"} />
            </Button>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
