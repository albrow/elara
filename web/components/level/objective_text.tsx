import flagImageUrl from "../../images/flag.png";
import robotImgUrl from "../../images/robot.png";
import fuelImgUrl from "../../images/fuel.png";
import bugImgUrl from "../../images/bug.png";
import lockedImgUrl from "../../images/locked.png";
import tvImgUrl from "../../images/tv.png";
import MiniSprite from "./mini_sprite";

export interface ObjectiveTextProps {
  text: string;
}

const imgUrlMappping = {
  "{robot}": robotImgUrl,
  "{goal}": flagImageUrl,
  "{fuel}": fuelImgUrl,
  "{bug}": bugImgUrl,
  "{gate}": lockedImgUrl,
  "{terminal}": tvImgUrl,
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
  return <span>{segments}</span>;
}
