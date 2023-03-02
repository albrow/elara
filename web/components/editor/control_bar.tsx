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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
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

import { range } from "../../lib/utils";
import type { EditorState } from "./editor";
import FunctionList from "./hover_docs/function_list";

export interface ControlBarProps {
  editorState: EditorState;
  availableFunctions: string[];
  onDeploy: () => void;
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
  onSliderChange?: (value: number) => void;
  onSliderChangeEnd?: (value: number) => void;
  sliderSize?: "full" | "small";
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

  const [showSliderTip, setShowSliderTip] = useState(true);

  const onSliderChange = useCallback(
    (value: number) => {
      setShowSliderTip(false);
      if (props.onSliderChange) {
        props.onSliderChange(value);
      }
    },
    [props]
  );

  const onSliderChangeEnd = useCallback(
    (value: number) => {
      setShowSliderTip(true);
      if (props.onSliderChangeEnd) {
        props.onSliderChangeEnd(value);
      }
    },
    [props]
  );

  return (
    <Box bg="gray.800" p={2} roundedTop="md">
      <Flex direction="row">
        <Box>
          {props.editorState === "editing" && (
            <>
              <Tooltip label="Deploy the code to the rover">
                <Button size="sm" colorScheme="green" onClick={props.onDeploy}>
                  <MdPlayArrow size="1.3em" style={{ marginRight: "0.1rem" }} />{" "}
                  Deploy
                </Button>
              </Tooltip>
              {props.onReset && (
                <Tooltip label="Reset back to the original code">
                  <Button ml={2} size="sm" onClick={props.onReset}>
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
              <Button
                colorScheme="red"
                color="black"
                size="sm"
                ml={1}
                onClick={props.onCancel}
              >
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
              <Button
                colorScheme="yellow"
                color="black"
                size="sm"
                ml={1}
                onClick={props.onPause}
              >
                <MdPause size="1.3em" />
              </Button>
            </Tooltip>
          )}
          {props.editorState === "paused" && (
            <Tooltip label="Play">
              <Button
                colorScheme="green"
                color="black"
                size="sm"
                ml={1}
                onClick={props.onPlay}
              >
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
          <>
            <Box
              ml="18px"
              width={props.sliderSize === "full" ? "180px" : "80px"}
              my="auto"
            >
              <Slider
                defaultValue={0}
                value={props.stepIndex}
                min={0}
                max={props.numSteps - 1}
                step={1}
                focusThumbOnChange={false}
                onChange={onSliderChange}
                onChangeEnd={onSliderChangeEnd}
              >
                {range(props.numSteps).map((i) => (
                  <SliderMark
                    key={i}
                    color="white"
                    fontSize="md"
                    fontWeight="bold"
                    value={i}
                    ml="-2px"
                  >
                    ·
                  </SliderMark>
                ))}
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <Tooltip
                  label="Click and drag to move through the code"
                  hidden={!showSliderTip}
                >
                  <SliderThumb />
                </Tooltip>
              </Slider>
            </Box>
            <Box my="auto" ml="12px">
              <Text as="span" fontSize="sm" color="white" verticalAlign="top">
                {props.stepIndex + 1}/{props.numSteps} ({getStateText()})
              </Text>
            </Box>
          </>
        )}
        <Spacer />
        <FunctionList funcNames={props.availableFunctions} />
        <Box hidden={!props.onDownload && !props.onUpload}>
          <Menu placement="bottom-end">
            <Tooltip label="Additional options">
              <MenuButton
                rounded="md"
                _hover={{ background: "gray.700" }}
                color="white"
                p={1}
                px={2}
              >
                <MdMenu size="1.3em" />
              </MenuButton>
            </Tooltip>
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

ControlBar.defaultProps = {
  sliderSize: "full",
};
