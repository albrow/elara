import { AspectRatio, Box, Image } from "@chakra-ui/react";

import { useState } from "react";
import { BG_INDEX } from "../lib/constants";

import hubBgImage from "../images/hub_bg_only.png";
import monitorImage from "../images/hub_monitor.png";
import journalImage from "../images/hub_journal.png";
import videoTabletImage from "../images/hub_video_tablet.png";

export default function Hub() {
  const [hoveringOver, setHoveringOver] = useState<
    "video-tablet" | "monitor" | "journal" | "none"
  >("none");

  return (
    <Box w="100%" h="100%" position="fixed" bg="black">
      <Image
        src={hubBgImage}
        zIndex={BG_INDEX}
        position="absolute"
        top="0"
        left="50%"
        transform="translateX(-50%)"
      />
      <AspectRatio maxW="1920px" ratio={16 / 9} ml="auto" mr="auto">
        <Box w="100%" h="100%" position="relative" opacity="0.5">
          <Box
            id="video-tablet-box"
            // border="5px solid blue"
            position="absolute"
            top="63%"
            left="26.5%"
            w="9.5%"
            h="24%"
            zIndex={BG_INDEX + 3}
            onMouseEnter={() => {
              setHoveringOver("video-tablet");
            }}
            onMouseLeave={() => setHoveringOver("none")}
            _hover={{ cursor: "pointer" }}
          />
          <Box
            id="monitor-box"
            // border="5px solid red"
            position="absolute"
            top="56.5%"
            left="39.5%"
            w="21%"
            h="31%"
            zIndex={BG_INDEX + 3}
            onMouseEnter={() => {
              setHoveringOver("monitor");
            }}
            onMouseLeave={() => setHoveringOver("none")}
            _hover={{ cursor: "pointer" }}
          />
          <Box
            id="journal-box"
            // border="5px solid green"
            position="absolute"
            top="77.5%"
            left="66%"
            w="11.5%"
            h="10.5%"
            zIndex={BG_INDEX + 3}
            onMouseEnter={() => {
              setHoveringOver("journal");
            }}
            onMouseLeave={() => setHoveringOver("none")}
            _hover={{ cursor: "pointer" }}
          />
        </Box>
      </AspectRatio>
      <Image
        src={videoTabletImage}
        zIndex={BG_INDEX + 1}
        position="absolute"
        top="0"
        left="50%"
        transform="translateX(-50%)"
        style={{
          filter:
            hoveringOver === "video-tablet"
              ? "drop-shadow(0px 0px 20px rgba(255, 255, 255, 1))"
              : "brightness(0.8)",
        }}
      />
      <Image
        src={monitorImage}
        zIndex={BG_INDEX + 1}
        position="absolute"
        top="0"
        left="50%"
        transform="translateX(-50%)"
        style={{
          filter:
            hoveringOver === "monitor"
              ? "drop-shadow(0px 0px 20px rgba(255, 255, 255, 1))"
              : "brightness(0.8)",
        }}
      />
      <Image
        src={journalImage}
        zIndex={BG_INDEX + 1}
        position="absolute"
        top="0"
        left="50%"
        transform="translateX(-50%)"
        style={{
          filter:
            hoveringOver === "journal"
              ? "drop-shadow(0px 0px 20px rgba(255, 255, 255, 1))"
              : "brightness(0.8)",
        }}
      />
    </Box>
  );
}
