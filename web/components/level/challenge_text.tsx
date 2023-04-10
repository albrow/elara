import { Text, Tooltip } from "@chakra-ui/react";
import { FaQuestionCircle } from "react-icons/fa";

export interface ChallengeTextProps {
  text: string;
}

function injectTooltips(text: string) {
  if (text.toLowerCase().includes("code length")) {
    const codeLengthIndex = text.toLowerCase().indexOf("code length");
    const codeLengthText = text.slice(codeLengthIndex, codeLengthIndex + 11);
    const beforeText = text.slice(0, codeLengthIndex);
    const afterText = text.slice(codeLengthIndex + 11);
    return (
      <>
        {beforeText}
        <Tooltip
          label="The number of characters in your code not including comments, spaces, newlines, or tabs."
          placement="top"
          hasArrow
        >
          <Text
            as="span"
            fontStyle="italic"
            textDecoration="underline"
            textDecorationStyle="dotted"
            _hover={{ textDecorationStyle: "solid" }}
          >
            {codeLengthText}
            <FaQuestionCircle
              size="0.8em"
              style={{
                paddingBottom: "0.1em",
                display: "inline",
                verticalAlign: "middle",
                marginLeft: "0.1em",
              }}
            />
          </Text>
        </Tooltip>
        {afterText}
      </>
    );
  }
  return text;
}

// Adds additional tooltips to some challenge text (e.g. explaining
// what "code length" means).
export default function ChallengeText(props: ChallengeTextProps) {
  return (
    <Text as="span" verticalAlign="middle">
      {injectTooltips(props.text)}
    </Text>
  );
}
