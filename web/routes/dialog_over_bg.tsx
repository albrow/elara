import { useRouteNode } from "react-router5";
import { useEffect, useCallback } from "react";

import { AspectRatio, Box, Image } from "@chakra-ui/react";
import { TREES } from "../lib/dialog_trees";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import { useSaveData } from "../hooks/save_data_hooks";
import { BG_INDEX as BG_Z_INDEX } from "../lib/constants";

import npcRightImage from "../images/npc_right.png";
import videoTabletBgImage from "../images/video_tablet_bg.png";
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
      <Image
        src={videoTabletBgImage}
        zIndex={BG_Z_INDEX}
        position="absolute"
        top="0"
        left="50%"
        transform="translateX(-50%)"
      />
      <AspectRatio maxW="1920px" ratio={16 / 9} mx="auto">
        <Box w="100%" h="100%" position="relative" opacity="0.99">
          <Image
            src={npcRightImage}
            zIndex={BG_Z_INDEX + 1}
            position="absolute"
            top="22%"
            left="14%"
            h="60%"
            opacity="0.8"
          />
          <Box position="absolute" w="80%" h="35%" bottom="1%">
            <DialogTree
              treeName={treeName}
              onEnd={handleDialogEnd}
              showNpcProfile={false}
              showHistory={false}
            />
          </Box>
        </Box>
      </AspectRatio>
    </Box>
  );
}
