import {
  Box,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";

export interface VolumeSliderProps {
  initialValPercent: number;
  onChange: (value: number) => void;
}

export default function VolumeSlider(props: VolumeSliderProps) {
  const [sliderValue, setSliderValue] = useState(props.initialValPercent);

  const onChangeEnd = useCallback(
    (v: number) => {
      setSliderValue(v);
      props.onChange(v);
    },
    [props]
  );

  return (
    <Flex p="3px">
      <Box minW="56px" p="3px">
        <Text fontSize="0.9em">{`${sliderValue.toFixed(0)}%`}</Text>
      </Box>
      <Slider
        aria-label="slider-master-volume"
        min={0}
        max={100}
        defaultValue={sliderValue}
        onChange={(v) => setSliderValue(v)}
        onChangeEnd={onChangeEnd}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb bg="blue.800" />
      </Slider>
    </Flex>
  );
}
