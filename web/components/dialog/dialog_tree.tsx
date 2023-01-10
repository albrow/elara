import { Button, Box, Image, Flex } from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  DialogChoice,
  TREES,
  NODES,
  CHOICES,
  MsgData,
} from "../../lib/dialog_trees";
import ChatMessage from "../../components/dialog/chat_message";

import npcRightImgUrl from "../../images/npc_right.png";

export interface DialogTreeProps {
  treeName: string;
  onEnd: () => void;
}

export default function DialogTree(props: DialogTreeProps) {
  const currTree = useCallback(() => {
    const tree = TREES[props.treeName];
    if (!tree) {
      throw new Error(`DialogTree "${props.treeName}" not found`);
    }
    return tree;
  }, [props.treeName]);

  // Special initialization logic to account for the fact that there
  // can be more than one NPC message in a row.
  let initialNode = NODES[currTree().startId];
  let initialMessages: MsgData[] = [];
  while (initialNode.choiceIds.length === 0) {
    // No choices. Continue immediately to the next node.
    if (initialNode.nextId == null) {
      throw new Error("nextId should not be null if there are no choices.");
    }
    initialMessages = [
      { text: initialNode.text, isPlayer: false, id: uuidv4() },
      ...initialMessages,
    ];
    initialNode = NODES[initialNode.nextId];
  }

  const [node, setNode] = useState(initialNode);
  const [chatHistory, setChatHistory] = useState<MsgData[]>(initialMessages);

  const choiceClickHandler = useCallback(
    (choice: DialogChoice) => {
      if (choice.nextId == null) {
        props.onEnd();
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
    [chatHistory, node.text, props]
  );

  return (
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
                    ml="1px"
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
  );
}
