import { Container, Button, Box, Image, Flex } from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { DialogChoice, TREES, NODES, CHOICES } from "../lib/dialog_tree";

import npcRightImgUrl from "../images/npc_right.png";
import { NAVBAR_HEIGHT } from "../lib/constants";
import ChatMessage from "../components/dialog/chat_message";
import { getNextSceneFromRoute } from "../lib/scenes";

type MsgData = {
  id: string;
  text: string;
  isPlayer: boolean;
};

export default function DialogOverBg() {
  const location = useLocation();
  const { treeName } = useParams();
  const navigate = useNavigate();

  const navigateToNextScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(location.pathname);
    if (nextScene == null) {
      throw new Error("Invalid route");
    }
    navigate(nextScene.route);
  }, [location, navigate]);

  const currTree = useCallback(() => {
    if (!treeName) {
      throw new Error("treeName is required");
    }
    const tree = TREES[treeName];
    if (!tree) {
      throw new Error(`DialogTree "${treeName}" not found`);
    }
    return tree;
  }, [treeName]);
  useEffect(() => {
    document.title = `Elara | ${currTree().name}`;
  }, [location, currTree]);

  const [node, setNode] = useState(NODES[currTree().startId]);
  const [chatHistory, setChatHistory] = useState<MsgData[]>([]);

  const choiceClickHandler = useCallback(
    (choice: DialogChoice) => {
      if (choice.nextId == null) {
        navigateToNextScene();
      } else {
        let newChats = [
          { text: choice.text, isPlayer: true, id: uuidv4() },
          { text: node.text, isPlayer: false, id: uuidv4() },
        ];
        let nextNode = NODES[choice.nextId];
        while (nextNode.choiceIds.length === 0) {
          // No choices. Continue immediately to the next node.
          if (nextNode.nextId == null) {
            throw new Error(
              "nextId should not be null if there are no choices."
            );
          }
          newChats = [
            { text: nextNode.text, isPlayer: false, id: uuidv4() },
            ...newChats,
          ];
          nextNode = NODES[nextNode.nextId];
        }
        setChatHistory([...newChats, ...chatHistory]);
        setNode(nextNode);
      }
    },
    [chatHistory, navigateToNextScene, node.text]
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
            src={npcRightImgUrl}
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
                {node.choiceIds.map((choiceId) => {
                  const choice = CHOICES[choiceId as keyof typeof CHOICES];
                  return (
                    <Button
                      key={choice.text}
                      onClick={() => choiceClickHandler(choice)}
                    >
                      {choice.text}
                    </Button>
                  );
                })}
              </Box>
            </Flex>
            <ChatMessage text={node.text} fromPlayer={false} />
            {chatHistory.map((msg) => (
              <ChatMessage
                key={msg.id}
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
