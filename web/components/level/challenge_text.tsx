import { Text, Tooltip } from "@chakra-ui/react";
import { BsJournalCode } from "react-icons/bs";
import { FaQuestionCircle } from "react-icons/fa";
import { compiler } from "markdown-to-jsx";

import { CODE_LEN_EXPLANATION } from "../../lib/constants";

export interface ChallengeTextProps {
  text: string;
}

function injectTooltips(text: string) {
  if (text.toLowerCase().includes("code length")) {
    // Split text so we can handle the "code length" part separately.
    // We want to add a tooltip to this part of the text.
    const codeLengthIndex = text.toLowerCase().indexOf("code length");
    const codeLengthText = text.slice(codeLengthIndex, codeLengthIndex + 11);

    // Before and after text might contain markdown, so we process it
    // accordingly.
    const beforeText = text.slice(0, codeLengthIndex);
    const afterText = text.slice(codeLengthIndex + 11);
    return (
      <>
        <span key={beforeText}>{compiler(beforeText)}</span>
        <Tooltip
          label={CODE_LEN_EXPLANATION}
          placement="top"
          variant="challenge"
          bg="gray.600"
        >
          <Text
            as="span"
            fontStyle="italic"
            textDecoration="underline"
            textDecorationStyle="dotted"
            _hover={{ textDecorationStyle: "solid", cursor: "help" }}
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
        <span key={afterText}>{compiler(afterText)}</span>
      </>
    );
  }
  if (text.toLowerCase().includes("function list")) {
    // Similarly, we want to add a tooltip to the "function list" part.
    const functionListIndex = text.toLowerCase().indexOf("function list");
    const functionListText = text.slice(
      functionListIndex,
      functionListIndex + 13
    );
    const beforeText = text.slice(0, functionListIndex);
    const afterText = text.slice(functionListIndex + 13);
    return (
      <>
        <span key={beforeText}>{compiler(beforeText)}</span>
        <Tooltip
          label="A list of all available functions for this level. Click the icon in the top right of the code editor to view the function list."
          placement="top"
          variant="challenge"
          bg="gray.600"
        >
          <Text as="span">
            <Text
              as="span"
              fontStyle="italic"
              textDecoration="underline"
              textDecorationStyle="dotted"
              _hover={{ textDecorationStyle: "solid" }}
            >
              {functionListText}
            </Text>{" "}
            <BsJournalCode
              size="1.1em"
              style={{
                paddingBottom: "0.1em",
                display: "inline",
                verticalAlign: "middle",
                marginLeft: "0.05em",
                marginRight: "0.05em",
              }}
            />
          </Text>
        </Tooltip>
        <span key={afterText}>{compiler(afterText)}</span>
      </>
    );
  }

  // Otherwise just parse the markdown as-is.
  return <span key={text}>{compiler(text)}</span>;
}

// Adds additional tooltips to some challenge text (e.g. explaining
// what "code length" means).
export default function ChallengeText(props: ChallengeTextProps) {
  return (
    <Text
      as="span"
      verticalAlign="middle"
      className="objective-text-md-content"
    >
      {injectTooltips(props.text)}
    </Text>
  );
}
