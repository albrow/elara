import { Container, Button, Box, Image, Flex } from "@chakra-ui/react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { DialogChoice, DIALOG_TREES } from "../lib/dialog_tree";

import npcRihtImgUrl from "../images/npc_right.png";
import { NAVBAR_HEIGHT } from "../lib/constants";
import ChatMessage from "../components/dialog/chat_message";

type MsgData = {
  text: string;
  isPlayer: boolean;
};

export default function DialogOverBg() {
  const location = useLocation();
  const { treeName } = useParams();

  const currTree = useCallback(() => {
    if (!treeName) {
      throw new Error("treeName is required");
    }
    const tree = DIALOG_TREES[treeName];
    if (!tree) {
      throw new Error(`DialogTree "${treeName}" not found`);
    }
    return tree;
  }, [treeName]);
  useEffect(() => {
    document.title = `Elara | ${currTree().name}`;
  }, [location, currTree]);

  const [node, setNode] = useState(currTree().start);
  const [chatHistory, setChatHistory] = useState<MsgData[]>([]);

  const choiceClickHandler = useCallback(
    (choice: DialogChoice) => {
      if (choice.next == null) {
        // TODO(albrow): Move on to the next scene.
        alert("Dialog ended. Should move to next scene.");
      } else {
        setChatHistory([
          ...chatHistory,
          { text: choice.text, isPlayer: true },
          { text: node.text, isPlayer: false },
        ]);
        setNode(choice.next);
      }
    },
    [chatHistory, node]
  );

  return (
    <Container
      maxW="container.lg"
      height={`calc(100vh - ${NAVBAR_HEIGHT}px)`}
      pb="20px"
    >
      <Flex direction="row" height="100%">
        <Box id="img-column" marginTop="auto">
          <Image
            src={npcRihtImgUrl}
            alt="profile"
            width={128}
            display="inline"
          />
        </Box>
        <Box
          id="chat-column"
          marginTop="auto"
          width="100%"
          overflowY="auto"
          maxH="50%"
        >
          <Flex
            direction="column-reverse"
            marginTop="auto"
            alignContent="bottom"
            justifyContent="bottom"
          >
            <Flex direction="row" alignContent="right" justifyContent="right">
              <Box>
                {node.choices.map((choice) => (
                  <Button
                    key={choice.text}
                    onClick={() => choiceClickHandler(choice)}
                  >
                    {choice.text}
                  </Button>
                ))}
              </Box>
            </Flex>
            <ChatMessage text={node.text} fromPlayer={false} />
            {chatHistory.map((msg) => (
              <ChatMessage
                key={msg.text}
                text={msg.text}
                fromPlayer={msg.isPlayer}
              />
            ))}
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
}
