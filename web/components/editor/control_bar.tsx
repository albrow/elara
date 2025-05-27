import {
  Flex,
  Box,
  Button,
  Spacer,
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
  MdReplay,
} from "react-icons/md";
import { FaSatelliteDish } from "react-icons/fa";

import { range } from "../../lib/utils";
import {
  BUTTON_RESPONSIVE_FONT_SCALE,
  BUTTON_RESPONSIVE_SCALE,
  TOOLTIP_RESPONSIVE_MAX_WIDTH,
} from "../../lib/responsive_design";
import type { EditorState } from "./editor";
import FunctionList from "./text_effects/function_list";

export interface ControlBarProps {
  editorState: EditorState;
  availableFunctions: string[];
  onDeploy: () => void;
  onCancel: () => void;
  onStepBack: () => void;
  onPause: () => void;
  onPlay: () => void;
  onStepForward: () => void;
  onReset?: () => void;
  stepIndex?: number;
  numSteps?: number;
  onSliderChange?: (value: number) => void;
  onSliderChangeEnd?: (value: number) => void;
}

export default function ControlBar(props: ControlBarProps) {
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
    <Box
      bg="gray.800"
      p={{ base: "6px", xl: "8px" }}
      roundedTop="md"
      className="control-bar"
    >
      <Flex direction="row">
        <Box>
          {props.editorState === "editing" && (
            <>
              <Tooltip
                maxW={TOOLTIP_RESPONSIVE_MAX_WIDTH}
                // fontSize={BODY_RESPONSIVE_FONT_SCALE}
                label="Deploy the code to the rover"
              >
                <Button
                  size={BUTTON_RESPONSIVE_SCALE}
                  fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
                  rounded={{ base: "3px", xl: "md" }}
                  colorScheme="green"
                  onClick={props.onDeploy}
                >
                  <FaSatelliteDish
                    size="1.2em"
                    style={{ marginRight: "0.2rem" }}
                  />{" "}
                  Deploy
                </Button>
              </Tooltip>
              {props.onReset && (
                <Tooltip
                  maxW={TOOLTIP_RESPONSIVE_MAX_WIDTH}
                  // fontSize={BODY_RESPONSIVE_FONT_SCALE}
                  label="Reset back to the original code"
                >
                  <Button
                    ml={{ base: "6px", xl: "8px" }}
                    size={BUTTON_RESPONSIVE_SCALE}
                    fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
                    rounded={{ base: "3px", xl: "md" }}
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
              <Tooltip
                maxW={TOOLTIP_RESPONSIVE_MAX_WIDTH}
                // fontSize={BODY_RESPONSIVE_FONT_SCALE}
                label="Stop"
              >
                <Button
                  colorScheme="red"
                  color="black"
                  size={BUTTON_RESPONSIVE_SCALE}
                  fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
                  rounded={{ base: "3px", xl: "md" }}
                  ml="4px"
                  onClick={props.onCancel}
                >
                  <MdStop size="1.3em" />
                </Button>
              </Tooltip>
            )}
          {(props.editorState === "running" ||
            props.editorState === "paused") && (
              <Tooltip
                maxW={TOOLTIP_RESPONSIVE_MAX_WIDTH}
                // fontSize={BODY_RESPONSIVE_FONT_SCALE}
                label="Skip backward"
              >
                <Button
                  size={BUTTON_RESPONSIVE_SCALE}
                  fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
                  rounded={{ base: "3px", xl: "md" }}
                  ml="4px"
                  onClick={props.onStepBack}
                >
                  <MdSkipPrevious size="1.3em" />
                </Button>
              </Tooltip>
            )}
          {props.editorState === "running" && (
            <Tooltip
              maxW={TOOLTIP_RESPONSIVE_MAX_WIDTH}
              // fontSize={BODY_RESPONSIVE_FONT_SCALE}
              label="Pause"
            >
              <Button
                colorScheme="yellow"
                color="black"
                size={BUTTON_RESPONSIVE_SCALE}
                fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
                rounded={{ base: "3px", xl: "md" }}
                ml="4px"
                onClick={props.onPause}
              >
                <MdPause size="1.3em" />
              </Button>
            </Tooltip>
          )}
          {props.editorState === "paused" && (
            <Tooltip
              maxW={TOOLTIP_RESPONSIVE_MAX_WIDTH}
              // fontSize={BODY_RESPONSIVE_FONT_SCALE}
              label="Play"
            >
              <Button
                colorScheme="green"
                color="black"
                size={BUTTON_RESPONSIVE_SCALE}
                fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
                rounded={{ base: "3px", xl: "md" }}
                ml="4px"
                onClick={props.onPlay}
              >
                <MdPlayArrow size="1.3em" />
              </Button>
            </Tooltip>
          )}
          {(props.editorState === "running" ||
            props.editorState === "paused") && (
              <Tooltip
                maxW={TOOLTIP_RESPONSIVE_MAX_WIDTH}
                // fontSize={BODY_RESPONSIVE_FONT_SCALE}
                label="Skip forward"
              >
                <Button
                  size={BUTTON_RESPONSIVE_SCALE}
                  fontSize={BUTTON_RESPONSIVE_FONT_SCALE}
                  rounded={{ base: "3px", xl: "md" }}
                  ml="4px"
                  onClick={props.onStepForward}
                >
                  <MdSkipNext size="1.3em" />
                </Button>
              </Tooltip>
            )}
        </Box>
        {props.numSteps && props.stepIndex !== undefined && (
          <>
            <Box ml="18px" width="190px" my="auto">
              <Slider
                defaultValue={0}
                value={props.stepIndex}
                min={0}
                max={props.numSteps}
                step={1}
                focusThumbOnChange={false}
                onChange={onSliderChange}
                onChangeEnd={onSliderChangeEnd}
              >
                {range(props.numSteps + 1).map((i) => (
                  <SliderMark
                    key={i}
                    color="white"
                    fontSize={{
                      base: "sm",
                      xl: "md",
                      // "2xl": "lg"
                    }}
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
                  maxW={TOOLTIP_RESPONSIVE_MAX_WIDTH}
                  // fontSize={BODY_RESPONSIVE_FONT_SCALE}
                  label="Click and drag to move through the code"
                  hidden={!showSliderTip}
                >
                  <SliderThumb />
                </Tooltip>
              </Slider>
            </Box>
            <Box my="auto" ml="12px">
              <Text
                as="span"
                fontSize={{
                  base: "sm",
                  // xl: "md",
                  // "2xl": "lg",
                }}
                color="white"
                verticalAlign="top"
              >
                Step: {props.stepIndex}/{props.numSteps}
              </Text>
            </Box>
          </>
        )}
        <Spacer />
        <FunctionList funcNames={props.availableFunctions} />
      </Flex>
    </Box>
  );
}
