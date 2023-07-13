import { Container } from "@chakra-ui/react";
import { useRouteNode } from "react-router5";
import { useEffect, useCallback } from "react";

import { TREES } from "../lib/dialog_trees";
import { NAVBAR_HEIGHT } from "../lib/constants";
import { useSceneNavigator } from "../hooks/scenes_hooks";
import DialogTree from "../components/dialog/dialog_tree";
import { useSaveData } from "../hooks/save_data_hooks";

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
    <Container
      maxW="container.lg"
      height={`calc(100vh - ${NAVBAR_HEIGHT}px)`}
      pb="20px"
    >
      <DialogTree treeName={treeName} onEnd={handleDialogEnd} />
    </Container>
  );
}
