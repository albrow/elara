import {
  Flex,
  Box,
  Button,
  Spacer,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
  Text,
} from "@chakra-ui/react";
import { useCallback } from "react";
import {
  MdPause,
  MdPlayArrow,
  MdSkipNext,
  MdSkipPrevious,
  MdStop,
  MdMenu,
  MdUploadFile,
  MdSave,
  MdReplay,
} from "react-icons/md";

import type { EditorState } from "./editor";

export interface ControlBarProps {
  editorState: EditorState;
  onRun: () => void;
  onCancel: () => void;
  onStepBack: () => void;
  onPause: () => void;
  onPlay: () => void;
  onStepForward: () => void;
  onDownload?: () => void;
  onUpload?: () => void;
  onReset?: () => void;
  stepIndex?: number;
  numSteps?: number;
}

export default function ControlBar(props: ControlBarProps) {
  const getStateText = useCallback(() => {
    switch (props.editorState) {
      case "editing":
        return "editing";
      case "running":
        return "running...";
      case "paused":
        return "paused";
      default:
        throw Error(`Invalid editor state: ${props.editorState}`);
    }
  }, [props.editorState]);

  return (
    <Box bg="gray.800" p={2} roundedTop="md">
      <Flex direction="row">
        <Box>
          {props.editorState === "editing" && (
            <>
              <Button size="sm" colorScheme="green" onClick={props.onRun}>
                <MdPlayArrow size="1.3em" style={{ marginRight: "0.1rem" }} />{" "}
                Run
              </Button>
              {props.onReset && (
                <Tooltip label="Reset the code to how it was at the start of the level">
                  <Button
                    ml={2}
                    size="sm"
                    // color="blue.300"
                    onClick={props.onReset}
                  >
                    <MdReplay size="1.3em" style={{ marginRight: "0.1rem" }} />{" "}
                    Reset
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </Box>
        <Box>
          {(props.editorState === "running" ||
            props.editorState === "paused") && (
            <Tooltip label="Stop">
              <Button size="sm" ml={1} onClick={props.onCancel}>
                <MdStop size="1.3em" />
              </Button>
            </Tooltip>
          )}
          {(props.editorState === "running" ||
            props.editorState === "paused") && (
            <Tooltip label="Skip backward">
              <Button size="sm" ml={1} onClick={props.onStepBack}>
                <MdSkipPrevious size="1.3em" />
              </Button>
            </Tooltip>
          )}
          {props.editorState === "running" && (
            <Tooltip label="Pause">
              <Button size="sm" ml={1} onClick={props.onPause}>
                <MdPause size="1.3em" />
              </Button>
            </Tooltip>
          )}
          {props.editorState === "paused" && (
            <Tooltip label="Play">
              <Button size="sm" ml={1} onClick={props.onPlay}>
                <MdPlayArrow size="1.3em" />
              </Button>
            </Tooltip>
          )}
          {(props.editorState === "running" ||
            props.editorState === "paused") && (
            <Tooltip label="Skip forward">
              <Button size="sm" ml={1} onClick={props.onStepForward}>
                <MdSkipNext size="1.3em" />
              </Button>
            </Tooltip>
          )}
        </Box>
        {props.numSteps && props.stepIndex !== undefined && (
          <Box my="auto" ml="10px">
            <Text as="span" fontSize="sm" color="white">
              Step {props.stepIndex + 1}/{props.numSteps}
            </Text>
            <Text as="span" fontSize="sm" color="white">
              {" "}
              ({getStateText()})
            </Text>
          </Box>
        )}
        <Spacer />
        <Box hidden={!props.onDownload && !props.onUpload}>
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
                onClick={props.onDownload}
              >
                <MdSave style={{ marginRight: "0.3rem" }} />
                Download
              </MenuItem>
              <MenuItem
                background="gray.700"
                color="white"
                _hover={{ background: "gray.600" }}
                onClick={props.onUpload}
              >
                <MdUploadFile style={{ marginRight: "0.3rem" }} />
                Upload
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  );
}
