import {
  Flex,
  Box,
  Button,
  Spacer,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import {
  MdPause,
  MdPlayArrow,
  MdSkipNext,
  MdSkipPrevious,
  MdStop,
  MdMenu,
  MdUploadFile,
  MdSave,
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
  saveCodeHandler: () => void;
  loadCodeHandler: () => void;
}

export default function ControlBar(props: ControlBarProps) {
  return (
    <Box bg="gray.800" p={2} roundedTop="md">
      <Flex direction="row">
        <Box>
          {!props.isRunning && (
            <Button size="sm" colorScheme="green" onClick={props.runHandler}>
              <MdPlayArrow size="1.3em" style={{ marginRight: "0.1rem" }} /> Run
            </Button>
          )}
          {props.isRunning && (
            <Button size="sm" colorScheme="red" onClick={props.stopHandler}>
              <MdStop size="1.3em" style={{ marginRight: "0.1rem" }} /> Stop
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
              <MdSkipPrevious size="1.3em" />
            </Button>
          )}
          {props.isRunning && !props.isPaused && (
            <Button
              size="sm"
              colorScheme="whiteAlpha"
              ml={1}
              onClick={props.pauseHandler}
            >
              <MdPause size="1.3em" />
            </Button>
          )}
          {props.isRunning && props.isPaused && (
            <Button
              size="sm"
              colorScheme="whiteAlpha"
              ml={1}
              onClick={props.resumeHandler}
            >
              <MdPlayArrow size="1.3em" />
            </Button>
          )}
          {props.isRunning && (
            <Button
              size="sm"
              colorScheme="whiteAlpha"
              ml={1}
              onClick={props.stepForwardHandler}
            >
              <MdSkipNext size="1.3em" />
            </Button>
          )}
        </Box>
        <Spacer />
        <Box>
          <Menu placement="bottom-end">
            <MenuButton
              rounded="md"
              _hover={{ background: "gray.700" }}
              color="white"
              p={1}
              px={2}
            >
              <MdMenu size="1.3em" />
            </MenuButton>
            <MenuList
              background="gray.700"
              borderColor="black"
              shadow="dark-lg"
            >
              <MenuItem
                background="gray.700"
                color="white"
                _hover={{ background: "gray.600" }}
                onClick={props.saveCodeHandler}
              >
                <MdSave style={{ marginRight: "0.3rem" }} />
                Save
              </MenuItem>
              <MenuItem
                background="gray.700"
                color="white"
                _hover={{ background: "gray.600" }}
                onClick={props.loadCodeHandler}
              >
                <MdUploadFile style={{ marginRight: "0.3rem" }} />
                Load
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  );
}
