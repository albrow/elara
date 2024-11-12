import { Box, Flex, Text } from "@chakra-ui/react";

import {
  MdCheckCircle,
  MdCheckCircleOutline,
  MdMessage,
  MdLightbulb,
  MdArrowDropDownCircle,
} from "react-icons/md";
import { useCallback } from "react";
import { BsStarFill, BsStar } from "react-icons/bs";
import { useHintsModal } from "../../hooks/hints_modal_hooks";
import { LevelData } from "../../../elara-lib/pkg/elara_lib";
import { Scene } from "../../lib/scenes";
import { useDialogModal } from "../../hooks/dialog_modal_hooks";
import {
  LEVEL_TOP_BAR_RESPONSIVE_HEIGHT,
  NAVBAR_RESPONSIVE_HEIGHT,
  TITLE_FONT_SIZE_BASE,
} from "../../lib/responsive_design";
import { useLevelSelectModal } from "../../hooks/level_select_modal_hooks";
import ObjectiveText from "./objective_text";
import ChallengeText from "./challenge_text";
import LevelTopBarButton from "./level_top_bar_button";

export interface LevelTopBarProps {
  currScene: Scene | null;
  currLevel: LevelData;
  dialogTreeName: string | null;
}

export default function LevelTopBar(props: LevelTopBarProps) {
  const [showHintsModal] = useHintsModal();
  const [showDialogModal] = useDialogModal();
  const [showLevelSelectModal] = useLevelSelectModal();

  const getObjectiveIcon = useCallback(() => {
    if (props.currScene !== null && props.currScene.completed) {
      return (
        <MdCheckCircle
          size="1.1em"
          color="var(--chakra-colors-green-400)"
          style={{
            marginRight: "0.2rem",
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      );
    }
    return (
      <MdCheckCircleOutline
        size="1.1em"
        color="var(--chakra-colors-gray-400)"
        style={{
          marginRight: "0.2rem",
          display: "inline",
          verticalAlign: "middle",
        }}
      />
    );
  }, [props.currScene]);

  const getChallengeIcon = useCallback(() => {
    if (props.currScene !== null && props.currScene.challengeCompleted) {
      return (
        <BsStarFill
          size="1.1em"
          color="var(--chakra-colors-yellow-400)"
          style={{
            marginRight: "0.2rem",
            display: "inline",
            verticalAlign: "middle",
          }}
        />
      );
    }
    return (
      <BsStar
        size="1.1em"
        color="var(--chakra-colors-gray-400)"
        style={{
          marginRight: "0.2rem",
          display: "inline",
          verticalAlign: "middle",
        }}
      />
    );
  }, [props.currScene]);

  return (
    <Box
      position="fixed"
      w="100%"
      minW="1200px"
      mt={NAVBAR_RESPONSIVE_HEIGHT}
      whiteSpace="nowrap"
      bg="gray.700"
      color="gray.300"
      borderTop="1px solid black"
      borderBottom="1px solid black"
      h={LEVEL_TOP_BAR_RESPONSIVE_HEIGHT}
      boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
    >
      <Box p="10px" maxW="1200px" mx="auto">
        <Box>
          <Flex>
            <Text
              fontSize={TITLE_FONT_SIZE_BASE}
              fontWeight="bold"
              as="span"
              verticalAlign="middle"
            >
              Level {props.currScene?.levelIndex || 0}: {props.currLevel.name}
            </Text>
            <Box ml="12px" my="auto" mt="auto">
              <LevelTopBarButton onClick={() => showLevelSelectModal()}>
                <MdArrowDropDownCircle
                  size="1em"
                  style={{ marginRight: "0.3rem" }}
                />{" "}
                Choose level
              </LevelTopBarButton>
            </Box>
            {props.currScene?.hints != null &&
              props.currScene?.hints.length > 0 && (
                <Box ml="4px" my="auto" mt="auto">
                  <LevelTopBarButton onClick={showHintsModal}>
                    <MdLightbulb size="1em" style={{ marginRight: "0.3rem" }} />{" "}
                    Show hints
                  </LevelTopBarButton>
                </Box>
              )}
            {props.dialogTreeName != null && (
              <Box ml="4px" my="auto">
                <LevelTopBarButton
                  onClick={() => showDialogModal(props.dialogTreeName!)}
                >
                  <MdMessage size="1em" style={{ marginRight: "0.3rem" }} />{" "}
                  Show dialog
                </LevelTopBarButton>
              </Box>
            )}
          </Flex>
        </Box>
        <Box>
          <Text as="span" verticalAlign="middle">
            {getObjectiveIcon()}
            <Text as="span" verticalAlign="middle" fontWeight="bold">
              Objective:
            </Text>{" "}
            <ObjectiveText text={props.currLevel.objective} />
          </Text>
          {props.currLevel.challenge !== "" && props.currScene?.completed && (
            <Text as="span" ml="0.5em" verticalAlign="middle">
              {getChallengeIcon()}
              <Text as="span" verticalAlign="middle" fontWeight="bold">
                Challenge:
              </Text>{" "}
              <ChallengeText text={props.currLevel.challenge} />
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
