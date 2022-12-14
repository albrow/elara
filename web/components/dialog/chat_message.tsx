import { Box, Flex, Text } from "@chakra-ui/react";

export interface ChatMessageProps {
  text: string;
  fromPlayer: boolean;
}

export default function ChatMessage(props: ChatMessageProps) {
  return (
    <Flex
      key={props.text}
      direction="row"
      alignContent={props.fromPlayer ? "right" : "left"}
      justifyContent={props.fromPlayer ? "right" : "left"}
    >
      <Box
        my="10px"
        py="12px"
        px="18px"
        borderRadius="lg"
        bg={props.fromPlayer ? "gray.300" : "blue.200"}
        mr={props.fromPlayer ? 0 : "100px"}
        ml={props.fromPlayer ? "100px" : 0}
      >
        <Text fontWeight="bold">{props.text}</Text>
      </Box>
    </Flex>
  );
}
