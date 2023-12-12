import { Box, Image } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouteNode } from "react-router5";
import { AnimateKeyframes } from "react-simple-animate";
import { BOARD_BG_Z_INDEX as BG_Z_INDEX } from "../lib/constants";

import hubBgImage from "../images/hub_bg_only.jpg";
import monitorImage from "../images/hub_monitor.png";
import journalImage from "../images/hub_journal.png";
import videoTabletImage from "../images/hub_video_tablet.png";
import incomingCallIcon from "../images/hub_video_tablet_call_icon.png";

import {
  useJournalPages,
  useLevels,
  useNextUnlockedScene,
  useSceneNavigator,
} from "../hooks/scenes_hooks";
import BlinkingText from "../components/blinking_text";
import { useLevelSelectModal } from "../hooks/level_select_modal_hooks";
import { useSaveData } from "../hooks/save_data_hooks";
import { useDialogModal } from "../hooks/dialog_modal_hooks";

export default function Hub() {
  const [hoveringOver, setHoveringOver] = useState<
    "video-tablet" | "monitor" | "journal" | "none"
  >("none");
  const { navigateToNextJournalPage, navigateToScene } = useSceneNavigator();
  const LEVELS = useLevels();
  const JOURNAL_PAGES = useJournalPages();
  const nextUnlockedScene = useNextUnlockedScene();
  const { route } = useRouteNode("");
  const [showLevelSelectModal] = useLevelSelectModal();
  const [saveData, _] = useSaveData();
  const [showDialogModal] = useDialogModal();

  const getDialogTree = useCallback(() => {
    if (
      nextUnlockedScene.type === "journal" &&
      saveData.seenJournalPages.length < 2 &&
      !saveData.seenDialogTrees.includes("explain_journal")
    ) {
      // After the first level, the player needs to click on the journal in order to
      // proceed. This dialog tree explains that.
      return "explain_journal";
    }
    return null;
  }, [
    nextUnlockedScene.type,
    saveData.seenDialogTrees,
    saveData.seenJournalPages,
  ]);

  useEffect(() => {
    if (getDialogTree() != null) {
      showDialogModal(getDialogTree()!);
    }
  }, [getDialogTree, showDialogModal]);

  useEffect(() => {
    document.title = "Elara | Hub";
  }, [route.name]);

  // Automatically navigate to the next unlocked scene if it is a cutscene.
  // This helps prevent players from getting stuck since the cutscene must
  // be completed before they can continue.
  useEffect(() => {
    if (nextUnlockedScene.type === "cutscene" && !nextUnlockedScene.completed) {
      navigateToScene(nextUnlockedScene);
    }
  }, [navigateToScene, nextUnlockedScene]);

  const journalUnlocked = useMemo(
    () => JOURNAL_PAGES[0].unlocked,
    [JOURNAL_PAGES]
  );

  const monitorUnlocked = useMemo(() => LEVELS[0].unlocked, [LEVELS]);

  const videoTabletImageFilter = useMemo(() => {
    if (
      hoveringOver === "video-tablet" &&
      nextUnlockedScene.type === "dialog"
    ) {
      return "drop-shadow(0px 0px 20px white)";
    }
    if (nextUnlockedScene.type === "dialog") {
      return "drop-shadow(0px 0px 15px var(--chakra-colors-yellow-400)) brightness(0.9)";
    }
    return "brightness(0.4)";
  }, [hoveringOver, nextUnlockedScene.type]);

  const monitorImageFilter = useMemo(() => {
    if (!monitorUnlocked) {
      return "brightness(0.4)";
    }
    if (hoveringOver === "monitor") {
      return "drop-shadow(0px 0px 20px white)";
    }
    if (nextUnlockedScene.type === "level" && !nextUnlockedScene.completed) {
      return "drop-shadow(0px 0px 15px var(--chakra-colors-yellow-400)) brightness(0.9)";
    }
    return "brightness(0.9)";
  }, [
    hoveringOver,
    monitorUnlocked,
    nextUnlockedScene.completed,
    nextUnlockedScene.type,
  ]);

  const journalImageFilter = useMemo(() => {
    if (!journalUnlocked) {
      return "brightness(0.4)";
    }
    if (hoveringOver === "journal") {
      return "drop-shadow(0px 0px 20px white)";
    }
    if (nextUnlockedScene.type === "journal" && !nextUnlockedScene.completed) {
      return "drop-shadow(0px 0px 15px var(--chakra-colors-yellow-400)) brightness(0.9)";
    }
    return "brightness(0.9)";
  }, [
    hoveringOver,
    journalUnlocked,
    nextUnlockedScene.completed,
    nextUnlockedScene.type,
  ]);

  return (
    <Box w="100%" h="100%" position="fixed" bg="black">
      <Box
        bgColor="black"
        bgImage={`url("${hubBgImage}")`}
        bgSize="cover"
        width="100vw"
        height="56.25vw"
        maxHeight="100vh"
        maxWidth="177.78vh"
        mx="auto"
        my="0"
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={BG_Z_INDEX}
      >
        <Box
          id="video-tablet-box"
          position="absolute"
          top="63%"
          left="26.5%"
          w="9.5%"
          h="24%"
          zIndex={BG_Z_INDEX + 3}
          _hover={{
            cursor:
              nextUnlockedScene.type === "dialog" ? "pointer" : "not-allowed",
          }}
          onMouseEnter={() => {
            setHoveringOver("video-tablet");
          }}
          onMouseLeave={() => setHoveringOver("none")}
          onClick={() => {
            if (nextUnlockedScene.type === "dialog") {
              navigateToScene(nextUnlockedScene);
            }
          }}
        >
          {nextUnlockedScene.type === "dialog" && (
            <Box
              position="relative"
              bottom="24%"
              height="24%"
              w="140%"
              left="-30%"
              zIndex={BG_Z_INDEX + 5}
            >
              <BlinkingText text="Incoming Call!" />
            </Box>
          )}
        </Box>
        <Box
          id="monitor-box"
          position="absolute"
          top="56.5%"
          left="39.5%"
          w="21%"
          h="31%"
          zIndex={BG_Z_INDEX + 3}
          _hover={{
            cursor: monitorUnlocked ? "pointer" : "not-allowed",
          }}
          onMouseEnter={() => {
            setHoveringOver("monitor");
          }}
          onMouseLeave={() => setHoveringOver("none")}
          onClick={() => {
            if (monitorUnlocked) {
              showLevelSelectModal();
            }
          }}
        >
          {nextUnlockedScene.type === "level" &&
            !nextUnlockedScene.completed && (
              <Box
                position="relative"
                height="24%"
                bottom="24%"
                w="100%"
                zIndex={BG_Z_INDEX + 5}
                justifyContent="center"
              >
                <BlinkingText text="New Levels!" />
              </Box>
            )}
        </Box>
        <Box
          id="journal-box"
          position="absolute"
          top="77.5%"
          left="66%"
          w="11.5%"
          h="10.5%"
          zIndex={BG_Z_INDEX + 3}
          _hover={{
            cursor: journalUnlocked ? "pointer" : "not-allowed",
          }}
          onMouseEnter={() => {
            setHoveringOver("journal");
          }}
          onMouseLeave={() => setHoveringOver("none")}
          onClick={() => {
            if (journalUnlocked) {
              navigateToNextJournalPage();
            }
          }}
        >
          {nextUnlockedScene.type === "journal" &&
            !nextUnlockedScene.completed && (
              <Box
                position="relative"
                bottom="50%"
                height="50%"
                w="150%"
                left="-25%"
                zIndex={BG_Z_INDEX + 5}
                justifyContent="center"
              >
                <BlinkingText text="New Journal Pages!" />
              </Box>
            )}
        </Box>
        <Image
          src={videoTabletImage}
          zIndex={BG_Z_INDEX + 1}
          position="absolute"
          objectFit="cover"
          width="100vw"
          height="56.25vw"
          maxHeight="100vh"
          maxWidth="177.78vh"
          mx="auto"
          my="0"
          top="0"
          left="0"
          right="0"
          bottom="0"
          style={{
            filter: videoTabletImageFilter,
          }}
        />
        {/* Use this box to align the transform-origin for the
        incoming call icon. To do this, you need to make sure your screen size
        is equal to the size of the background (e.g. make it exactly 16x9 aspect
        ratio) */}
        {/* <Box
          position="fixed"
          w="2px"
          h="2px"
          bgColor="red"
          zIndex={BG_Z_INDEX + 5}
          left="31.2%"
          top="73.8%"
        /> */}
        {nextUnlockedScene.type === "dialog" && (
          <AnimateKeyframes
            play
            duration={1}
            iterationCount="infinite"
            keyframes={[
              // A simple phone ringing animation.
              { 0: "transform: rotate(0deg)" },
              { 10: "transform: rotate(-5deg)" },
              { 20: "transform: rotate(0deg)" },
              { 30: "transform: rotate(5deg)" },
              { 40: "transform: rotate(0deg)" },
              { 47: "transform: rotate(-2deg)" },
              { 54: "transform: rotate(0deg)" },
              { 61: "transform: rotate(2deg)" },
              { 68: "transform: rotate(0deg)" },
            ]}
            render={({ style }) => (
              <Image
                src={incomingCallIcon}
                zIndex={BG_Z_INDEX + 1}
                position="absolute"
                objectFit="cover"
                width="100vw"
                height="56.25vw"
                maxHeight="100vh"
                maxWidth="177.78vh"
                mx="auto"
                my="0"
                top="0"
                left="0"
                right="0"
                bottom="0"
                opacity="0.6"
                // Align the orgin of the rotation to the center of the icon.
                transformOrigin="31.2% 73.8%"
                style={style}
              />
            )}
          />
        )}
        <Image
          src={monitorImage}
          zIndex={BG_Z_INDEX + 1}
          position="absolute"
          objectFit="cover"
          width="100vw"
          height="56.25vw"
          maxHeight="100vh"
          maxWidth="177.78vh"
          mx="auto"
          my="0"
          top="0"
          left="0"
          right="0"
          bottom="0"
          style={{
            filter: monitorImageFilter,
          }}
        />
        <Image
          src={journalImage}
          zIndex={BG_Z_INDEX + 1}
          position="absolute"
          objectFit="cover"
          width="100vw"
          height="56.25vw"
          maxHeight="100vh"
          maxWidth="177.78vh"
          mx="auto"
          my="0"
          top="0"
          left="0"
          right="0"
          bottom="0"
          style={{
            filter: journalImageFilter,
          }}
        />
      </Box>
    </Box>
  );
}
