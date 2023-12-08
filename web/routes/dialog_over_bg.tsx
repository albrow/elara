import { useRouteNode } from "react-router5";
import { useEffect, useCallback } from "react";

import { Box, Image } from "@chakra-ui/react";
import { TREES } from "../lib/dialog_trees";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import { useSaveData } from "../hooks/save_data_hooks";
import { BOARD_BG_Z_INDEX as BG_Z_INDEX } from "../lib/constants";

import npcRightImage from "../images/npc_right.png";
import videoTabletBgImage from "../images/video_tablet_bg.jpg";
import DialogTree from "../components/dialog/dialog_tree";

export default function DialogOverBg() {
  const { route } = useRouteNode("");
  const treeName = route.params.treeName as string | null;
  if (treeName == null) {
    throw new Error("treeName is required");
  }
  const { navigateToHub } = useSceneNavigator();
  const [_, { markDialogSeen }] = useSaveData();

  const currTree = useCallback(() => {
    if (treeName == null) {
      throw new Error("treeName is required");
    }
    const tree = TREES[treeName];
    if (!tree) {
      throw new Error(`DialogTree "${treeName}" not found`);
    }
    return tree;
  }, [treeName]);

  const handleDialogEnd = useCallback(() => {
    markDialogSeen(treeName);
    navigateToHub();
  }, [markDialogSeen, navigateToHub, treeName]);

  useEffect(() => {
    document.title = `Elara | ${currTree().name}`;
  }, [route, currTree]);

  return (
    <Box w="100%" h="100%" position="fixed" bg="black">
      <Box
        bgColor="black"
        bgImage={`url("${videoTabletBgImage}")`}
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
        <Image
          src={npcRightImage}
          zIndex={BG_Z_INDEX + 1}
          position="absolute"
          top="22%"
          left="14%"
          h="60%"
          opacity="0.8"
        />
        <Box position="absolute" bottom="1%" right="0" w="60%" h="60%">
          <DialogTree
            treeName={treeName}
            onEnd={handleDialogEnd}
            showNpcProfile={false}
            showHistory={false}
          />
        </Box>
      </Box>
    </Box>
  );
}
