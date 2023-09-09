import { Box, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import {
  MdInfoOutline,
  MdLightbulbOutline,
  MdWarningAmber,
} from "react-icons/md";

export interface CardProps {
  type: "tip" | "try_it" | "warning";
}

export default function Card(props: React.PropsWithChildren<CardProps>) {
  const bgColor = useMemo(() => {
    switch (props.type) {
      case "tip":
        return "blue.100";
      case "try_it":
        return "yellow.100";
      case "warning":
        return "orange.200";
      default:
        throw new Error(`Invalid card type: ${props.type}`);
    }
  }, [props.type]);

  const borderColor = useMemo(() => {
    switch (props.type) {
      case "tip":
        return "blue.200";
      case "try_it":
        return "yellow.300";
      case "warning":
        return "orange.300";
      default:
        throw new Error(`Invalid card type: ${props.type}`);
    }
  }, [props.type]);

  const icon = useMemo(() => {
    switch (props.type) {
      case "tip":
        return (
          <MdInfoOutline
            style={{
              display: "inline",
              verticalAlign: "middle",
              marginRight: "4px",
            }}
            size="1.2em"
          />
        );
      case "try_it":
        return (
          <MdLightbulbOutline
            style={{
              display: "inline",
              verticalAlign: "middle",
              marginRight: "4px",
            }}
            size="1.2em"
          />
        );
      case "warning":
        return (
          <MdWarningAmber
            style={{
              display: "inline",
              verticalAlign: "middle",
              marginRight: "4px",
            }}
            size="1.2em"
          />
        );
      default:
        throw new Error(`Invalid card type: ${props.type}`);
    }
  }, [props.type]);

  const textPrefix = useMemo(() => {
    switch (props.type) {
      case "tip":
        return "Tip: ";
      case "try_it":
        return "Try it: ";
      case "warning":
        return "Warning: ";
      default:
        throw new Error(`Invalid card type: ${props.type}`);
    }
  }, [props.type]);

  return (
    <Box
      bg={bgColor}
      px="16px"
      py="12px"
      borderRadius="md"
      mt="36px"
      mb={props.type === "try_it" ? "0px" : "36px"}
      mx="24px"
      borderColor={borderColor}
      borderWidth="1px"
    >
      {icon}
      <Text as="span" fontWeight="bold" display="inline" verticalAlign="middle">
        {textPrefix}
      </Text>
      <Text as="span" display="inline" verticalAlign="middle">
        {props.children}
      </Text>
    </Box>
  );
}
