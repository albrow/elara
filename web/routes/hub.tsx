import { AspectRatio, Box, Image } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { BG_INDEX as BG_Z_INDEX, MIN_BG_WIDTH } from "../lib/constants";
import LevelSlectModal from "../components/hub/level_select_modal";

import hubBgImage from "../images/hub_bg_only.png";
import monitorImage from "../images/hub_monitor.png";
import journalImage from "../images/hub_journal.png";
import videoTabletImage from "../images/hub_video_tablet.png";
import {
  useJournalPages,
  useLevels,
  useNextUnlockedScene,
  useSceneNavigator,
  useScenes,
} from "../hooks/scenes_hooks";
import BlinkingText from "../components/hub/blinking_text";

export default function Hub() {
  const [hoveringOver, setHoveringOver] = useState<
    "video-tablet" | "monitor" | "journal" | "none"
  >("none");
  const [levelSelectModalVisible, setLevelSelectModalVisible] = useState(false);
  const { navigateToNextJournalPage, navigateToScene } = useSceneNavigator();
  const SCENES = useScenes();
  const LEVELS = useLevels();
  const JOURNAL_PAGES = useJournalPages();

  const nextUnlockedScene = useNextUnlockedScene();

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
    return "brightness(0.5)";
  }, [hoveringOver, nextUnlockedScene.type]);

  const monitorImageFilter = useMemo(() => {
    if (!monitorUnlocked) {
      return "brightness(0.5)";
    }
    if (hoveringOver === "monitor") {
      return "drop-shadow(0px 0px 20px white)";
    }
    if (nextUnlockedScene.type === "level" && !nextUnlockedScene.completed) {
      return "drop-shadow(0px 0px 15px var(--chakra-colors-yellow-400)) brightness(0.9)";
    }
    return "brightness(0.8)";
  }, [
    hoveringOver,
    monitorUnlocked,
    nextUnlockedScene.completed,
    nextUnlockedScene.type,
  ]);

  const journalImageFilter = useMemo(() => {
    if (!journalUnlocked) {
      return "brightness(0.5)";
    }
    if (hoveringOver === "journal") {
      return "drop-shadow(0px 0px 20px white)";
    }
    if (nextUnlockedScene.type === "journal" && !nextUnlockedScene.completed) {
      return "drop-shadow(0px 0px 15px var(--chakra-colors-yellow-400)) brightness(0.9)";
    }
    return "brightness(0.8)";
  }, [
    hoveringOver,
    journalUnlocked,
    nextUnlockedScene.completed,
    nextUnlockedScene.type,
  ]);

  return (
    <>
      <LevelSlectModal
        visible={levelSelectModalVisible}
        setVisible={setLevelSelectModalVisible}
      />
      <Box w="100%" h="100%" minW={MIN_BG_WIDTH} position="fixed" bg="black">
        <Image
          src={hubBgImage}
          zIndex={BG_Z_INDEX}
          position="absolute"
          top="0"
          left="50%"
          transform="translateX(-50%)"
        />
        <AspectRatio maxW="1920px" ratio={16 / 9} mx="auto">
          <Box w="100%" h="100%" position="relative" opacity="0.99">
            <Box
              id="video-tablet-box"
              // border="5px solid blue"
              position="absolute"
              top="63%"
              left="26.5%"
              w="9.5%"
              h="24%"
              zIndex={BG_Z_INDEX + 3}
              _hover={{
                cursor:
                  nextUnlockedScene.type === "dialog"
                    ? "pointer"
                    : "not-allowed",
              }}
              onMouseEnter={() => {
                setHoveringOver("video-tablet");
              }}
              onMouseLeave={() => setHoveringOver("none")}
              onClick={() => {
                // TODO(albrow): Navigate to the next available dialog scene.
                // Also disable the video tablet if the next scene is not a dialog scene.
                navigateToScene(SCENES[0]);
              }}
            >
              {nextUnlockedScene.type === "dialog" && (
                <Box
                  position="relative"
                  bottom="24%"
                  w="140%"
                  left="-30%"
                  zIndex={BG_Z_INDEX + 5}
                >
                  <BlinkingText text="Click Here!" />
                </Box>
              )}
            </Box>
            <Box
              id="monitor-box"
              // border="5px solid red"
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
              onClick={() => setLevelSelectModalVisible(true)}
            >
              {nextUnlockedScene.type === "level" &&
                !nextUnlockedScene.completed && (
                  <Box
                    position="relative"
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
              // border="5px solid green"
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
              onClick={() => navigateToNextJournalPage()}
            >
              {nextUnlockedScene.type === "journal" &&
                !nextUnlockedScene.completed && (
                  <Box
                    position="relative"
                    bottom="50%"
                    w="150%"
                    left="-25%"
                    zIndex={BG_Z_INDEX + 5}
                    justifyContent="center"
                  >
                    <BlinkingText text="New Journal Pages!" />
                  </Box>
                )}
            </Box>
          </Box>
        </AspectRatio>
        <Image
          src={videoTabletImage}
          zIndex={BG_Z_INDEX + 1}
          position="absolute"
          top="0"
          left="50%"
          transform="translateX(-50%)"
          style={{
            filter: videoTabletImageFilter,
          }}
        />
        <Image
          src={monitorImage}
          zIndex={BG_Z_INDEX + 1}
          position="absolute"
          top="0"
          left="50%"
          transform="translateX(-50%)"
          style={{
            filter: monitorImageFilter,
          }}
        />
        <Image
          src={journalImage}
          zIndex={BG_Z_INDEX + 1}
          position="absolute"
          top="0"
          left="50%"
          transform="translateX(-50%)"
          style={{
            filter: journalImageFilter,
          }}
        />
      </Box>
    </>
  );
}
