import { Text } from "@chakra-ui/react";
import { compiler } from "markdown-to-jsx";

import flagImageUrl from "../../images/board/flag.png";
import groverDownUrl from "../../images/board/grover_down.png";
import energyCellImgUrl from "../../images/board/energy_cell.png";
import dataPointImgUrl from "../../images/board/data_point.png";
import buttonImgUrl from "../../images/board/button.png";
import gateImgUrl from "../../images/board/gate_ne_sw_locked.png";
import passwordGateImgUrl from "../../images/board/pw_gate_ne_sw_locked.png";
import MiniSprite from "./mini_sprite";

export interface ObjectiveTextProps {
  text: string;
}

const imgUrlMappping = {
  "{robot}": groverDownUrl,
  "{goal}": flagImageUrl,
  "{energyCell}": energyCellImgUrl,
  "{gate}": gateImgUrl,
  "{passwordGate}": passwordGateImgUrl,
  "{dataPoint}": dataPointImgUrl,
  "{button}": buttonImgUrl,
};

function splitText(text: string) {
  // First use a regex to split the text into segments, where each segment
  // is either a tag like "{robot}" or a string of text. The text may also
  // contain markdown, so we parse it.
  const segments = text.split(/({.*?})/);

  // Then map each segment to either a string or an image.
  return segments.map((segment, index) => {
    // We use @ts-ignore here because we know that segment might not
    // necessarily be a key in the imgUrlMappping object and are handling
    // that case below.
    // @ts-ignore
    const imgUrl = imgUrlMappping[segment];
    if (imgUrl) {
      // eslint-disable-next-line react/no-array-index-key
      return <MiniSprite key={`${segment}_${index}`} imgUrl={imgUrl} />;
    }
    // eslint-disable-next-line react/no-array-index-key
    return <span key={`${segment}_${index}`}>{compiler(segment)}</span>;
  });
}

// Formats text with tags like "{robot}" and "{goal}" into a span with
// inline images for each tag. This allows us to define level properties
// in Rust and then format them in the UI.
export default function ObjectiveText(props: ObjectiveTextProps) {
  const segments = splitText(props.text);
  return (
    <Text
      as="span"
      verticalAlign="middle"
      className="objective-text-md-content"
    >
      {segments}
    </Text>
  );
}
