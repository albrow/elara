import { Box, Image, Flex } from "@chakra-ui/react";
import { useState, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Animate, AnimateGroup } from "react-simple-animate";

import {
  DialogChoice,
  TREES,
  NODES,
  MsgData,
  CHOICES,
} from "../../lib/dialog_trees";
import ChatMessage from "../../components/dialog/chat_message";
import npcRightImgUrl from "../../images/npc_right.png";
import { useSoundManager } from "../../hooks/sound_manager_hooks";
import Choices from "./choices";

export interface DialogTreeProps {
  treeName: string;
  showNpcProfile?: boolean;
  showHistory?: boolean;
  onEnd: () => void;
}

export default function DialogTree(props: DialogTreeProps) {
  const { getSoundOrNull, stopAllSoundEffects } = useSoundManager();

  const currTree = useCallback(() => {
    const tree = TREES[props.treeName];
    if (!tree) {
      throw new Error(`DialogTree "${props.treeName}" not found`);
    }
    return tree;
  }, [props.treeName]);

  // Special initialization logic to account for the fact that there
  // can be more than one NPC message in a row.
  const [initialMessages, initialNode] = useMemo(() => {
    const messages = [];
    let node = NODES[currTree().startId];
    while (node.choiceIds.length === 0) {
      // No choices. Continue immediately to the next node.
      if (node.nextId == null) {
        throw new Error("nextId should not be null if there are no choices.");
      }
      messages.push({
        text: node.text,
        isPlayer: false,
        id: uuidv4(),
      });
      node = NODES[node.nextId];
    }
    return [messages, node];
  }, [currTree]);

  const [node, setNode] = useState(initialNode);
  const [chatHistory, setChatHistory] = useState<MsgData[]>(initialMessages);
  const [chosenChoices, setChosenChoices] = useState<string[]>([]);

  const choiceClickHandler = useCallback(
    (choice: DialogChoice) => {
      stopAllSoundEffects();
      if (choice.nextId == null) {
        props.onEnd();
      } else {
        if (!chosenChoices.includes(choice.text)) {
          setChosenChoices([...chosenChoices, choice.text]);
        }
        const newChats = [
          { text: node.text, isPlayer: false, id: uuidv4() },
          { text: choice.text, isPlayer: true, id: uuidv4() },
        ];
        const newNpcMessages = [];
        let nextNode = NODES[choice.nextId];

        // Play dialog sound effect (if any).
        const sound = getSoundOrNull(`dialog_${choice.nextId}`);
        if (sound) {
          sound.play();
        }

        while (nextNode.choiceIds.length === 0) {
          // No choices. Continue immediately to the next node.
          if (nextNode.nextId == null) {
            throw new Error(
              "nextId should not be null if there are no choices."
            );
          }
          newNpcMessages.push({
            text: nextNode.text,
            isPlayer: false,
            id: uuidv4(),
          });
          nextNode = NODES[nextNode.nextId];
        }
        if (props.showHistory) {
          setChatHistory([...chatHistory, ...newChats, ...newNpcMessages]);
        } else {
          setChatHistory(newNpcMessages);
        }
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
    [
      chatHistory,
      chosenChoices,
      getSoundOrNull,
      node.text,
      props,
      stopAllSoundEffects,
    ]
  );

  // New messages from the NPC (not including the most recent one).
  const newNpcMessages = useMemo(() => {
    let messages: MsgData[] = [];
    for (let i = chatHistory.length - 1; i >= 0; i -= 1) {
      if (chatHistory[i].isPlayer) {
        break;
      } else {
        messages = [chatHistory[i], ...messages];
      }
    }
    return messages;
  }, [chatHistory]);

  // Older messages from the NPC or player.
  const oldMessages = useMemo(
    () => chatHistory.slice(0, chatHistory.length - newNpcMessages.length),
    [chatHistory, newNpcMessages]
  );

  return (
    <Flex direction="row" height="100%">
      {props.showNpcProfile && (
        <Box id="img-column" marginTop="auto">
          <Image src={npcRightImgUrl} width={128} display="inline" />
        </Box>
      )}
      <Box
        id="chat-column"
        className="darker-scrollbar"
        marginTop="auto"
        width="100%"
        overflowY="scroll"
        maxH="100%"
        px="5px"
      >
        <Flex
          direction="column"
          marginTop="auto"
          alignContent="bottom"
          justifyContent="bottom"
        >
          {oldMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              text={msg.text}
              fromPlayer={msg.isPlayer}
            />
          ))}
          <AnimateGroup play>
            {newNpcMessages.map((msg, i) => (
              <Animate
                key={msg.id}
                sequenceIndex={i}
                delay={0.3}
                start={{ opacity: 0 }}
                end={{ opacity: 1 }}
              >
                <ChatMessage
                  key={msg.id}
                  text={msg.text}
                  fromPlayer={msg.isPlayer}
                />
              </Animate>
            ))}
            <Animate
              key={`${node.text}__${uuidv4()}`}
              sequenceIndex={newNpcMessages.length}
              delay={0.3}
              start={{ opacity: 0 }}
              end={{ opacity: 1 }}
            >
              <ChatMessage text={node.text} fromPlayer={false} />
            </Animate>
            <Animate
              key={`choices_${uuidv4()}`}
              sequenceIndex={newNpcMessages.length + 1}
              delay={0.3}
              start={{ opacity: 0 }}
              end={{ opacity: 1 }}
              render={({ style }) => (
                <Flex
                  direction="row"
                  flexWrap="wrap"
                  alignContent="right"
                  justifyContent="right"
                  style={style}
                >
                  <Choices
                    choices={node.choiceIds.map((id) => CHOICES[id])}
                    chosenChoices={chosenChoices}
                    onSelection={choiceClickHandler}
                  />
                </Flex>
              )}
            />
            {/* 
              NOTE(albrow): This empty Animate element is a workaround for an
              apparent bug in react-simple-animate. Without this here, the dialog
              choices will not appear if there is more than 1 message from the NPC
              at a time. I have no idea why.

              DO NOT REMOVE THIS.
            */}
            <Animate sequenceIndex={newNpcMessages.length + 2} delay={0.3} />
          </AnimateGroup>

          {/* A dummy div used for automatically scrolling to the bottom whenever new messages
      are added */}
          <div id="dialog-bottom" />
        </Flex>
      </Box>
    </Flex>
  );
}

DialogTree.defaultProps = {
  showNpcProfile: true,
  showHistory: true,
};
