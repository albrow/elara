import { Text } from "@chakra-ui/react";
import flagImageUrl from "../../images/board/flag.png";
import groverDownUrl from "../../images/board/grover_down.png";
import energyCellImgUrl from "../../images/board/energy_cell.png";
import lockedImgUrl from "../../images/board/locked.png";
import dataPointImgUrl from "../../images/board/data_point.png";
import buttonImgUrl from "../../images/board/button.png";
import MiniSprite from "./mini_sprite";

export interface ObjectiveTextProps {
  text: string;
}

const imgUrlMappping = {
  "{robot}": groverDownUrl,
  "{goal}": flagImageUrl,
  "{energyCell}": energyCellImgUrl,
  "{gate}": lockedImgUrl,
  "{dataPoint}": dataPointImgUrl,
  "{button}": buttonImgUrl,
};

function splitText(text: string) {
  // First use a regex to split the text into segments, where each segment
  // is either a tag like "{robot}" or a string of text.
  const segments = text.split(/({.*?})/);

  // Then map each segment to either a string or an image.
  return segments.map((segment) => {
    // We use @ts-ignore here because we know that segment might not
    // necessarily be a key in the imgUrlMappping object and are handling
    // that case below.
    // @ts-ignore
    const imgUrl = imgUrlMappping[segment];
    if (imgUrl) {
      return <MiniSprite key={segment} imgUrl={imgUrl} />;
    }
    return segment;
  });
}

// Formats text with tags like "{robot}" and "{goal}" into a span with
// inline images for each tag. This allows us to define level properties
// in Rust and then format them in the UI.
export default function ObjectiveText(props: ObjectiveTextProps) {
  const segments = splitText(props.text);
  return (
    <Text as="span" verticalAlign="middle">
      {segments}
    </Text>
  );
}
