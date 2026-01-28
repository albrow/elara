import { Text, Tooltip } from "@chakra-ui/react";
import { BsJournalCode } from "react-icons/bs";
import { FaQuestionCircle } from "react-icons/fa";
import { compiler } from "markdown-to-jsx";

import { CODE_LEN_EXPLANATION } from "../../lib/constants";

export interface ChallengeTextProps {
  text: string;
}

function injectTooltips(text: string) {
  const lowered = text.toLowerCase();

  // Tooltips for code length (English + Russian).
  if (lowered.includes("code length") || lowered.includes("длина кода")) {
    const phrase = lowered.includes("длина кода") ? "длина кода" : "code length";
    const codeLengthIndex = lowered.indexOf(phrase);
    const codeLengthText = text.slice(codeLengthIndex, codeLengthIndex + phrase.length);

    const beforeText = text.slice(0, codeLengthIndex);
    const afterText = text.slice(codeLengthIndex + phrase.length);
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

  // Tooltips for function list (English + Russian).
  if (lowered.includes("function list") || lowered.includes("список функций")) {
    const phrase = lowered.includes("список функций") ? "список функций" : "function list";
    const functionListIndex = lowered.indexOf(phrase);
    const functionListText = text.slice(
      functionListIndex,
      functionListIndex + phrase.length
    );
    const beforeText = text.slice(0, functionListIndex);
    const afterText = text.slice(functionListIndex + phrase.length);
    return (
      <>
        <span key={beforeText}>{compiler(beforeText)}</span>
        <Tooltip
          label="Список всех доступных функций для этого уровня. Нажмите значок в правом верхнем углу редактора кода, чтобы открыть список функций."
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
