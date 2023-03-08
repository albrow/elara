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
  const initialMessages: MsgData[] = [];
  while (initialNode.choiceIds.length === 0) {
    // No choices. Continue immediately to the next node.
    if (initialNode.nextId == null) {
      throw new Error("nextId should not be null if there are no choices.");
    }
    initialMessages.push({
      text: initialNode.text,
      isPlayer: false,
      id: uuidv4(),
    });
    initialNode = NODES[initialNode.nextId];
  }

  const [node, setNode] = useState(initialNode);
  const [chatHistory, setChatHistory] = useState<MsgData[]>(initialMessages);

  const choiceClickHandler = useCallback(
    (choice: DialogChoice) => {
      if (choice.nextId == null) {
        props.onEnd();
      } else {
        const newChats = [
          { text: node.text, isPlayer: false, id: uuidv4() },
          { text: choice.text, isPlayer: true, id: uuidv4() },
        ];
        let nextNode = NODES[choice.nextId];
        while (nextNode.choiceIds.length === 0) {
          // No choices. Continue immediately to the next node.
          if (nextNode.nextId == null) {
            throw new Error(
              "nextId should not be null if there are no choices."
            );
          }
          newChats.push({ text: nextNode.text, isPlayer: false, id: uuidv4() });
          nextNode = NODES[nextNode.nextId];
        }
        setChatHistory([...chatHistory, ...newChats]);
        setNode(nextNode);
      }
      // Always scroll to the bottom of the chat history.
      // We need to use setTimeout to make this happen *after* the DOM has updated.
      setTimeout(() => {
        document
          .querySelector("#dialog-bottom")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
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
          direction="column"
          marginTop="auto"
          alignContent="bottom"
          justifyContent="bottom"
        >
          {chatHistory.map((msg) => (
            <ChatMessage
              key={msg.id}
              text={msg.text}
              fromPlayer={msg.isPlayer}
            />
          ))}
          <ChatMessage text={node.text} fromPlayer={false} />
          <Flex
            direction="row"
            flexWrap="wrap"
            alignContent="right"
            justifyContent="right"
          >
            {node.choiceIds.map((choiceId) => {
              const choice = CHOICES[choiceId as keyof typeof CHOICES];
              return (
                <Button
                  ml="1px"
                  key={choice.text}
                  fontSize="1.1rem"
                  onClick={() => choiceClickHandler(choice)}
                >
                  {choice.text}
                </Button>
              );
            })}
          </Flex>
          {/* A dummy div used for automatically scrolling to the bottom whenever new messages
      are added */}
          <div id="dialog-bottom" />
        </Flex>
      </Box>
    </Flex>
  );
}
