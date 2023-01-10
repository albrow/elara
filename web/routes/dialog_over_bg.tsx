import { Container } from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";

import { TREES } from "../lib/dialog_trees";
import { NAVBAR_HEIGHT } from "../lib/constants";
import { getNextSceneFromRoute } from "../lib/scenes";

import DialogTree from "../components/dialog/dialog_tree";

export default function DialogOverBg() {
  const location = useLocation();
  const { treeName } = useParams();
  const navigate = useNavigate();

  const navigateToNextScene = useCallback(() => {
    const nextScene = getNextSceneFromRoute(location.pathname);
    if (nextScene == null) {
      throw new Error("Invalid route");
    }
    navigate(nextScene.route);
  }, [location, navigate]);

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

  useEffect(() => {
    document.title = `Elara | ${currTree().name}`;
  }, [location, currTree]);

  return (
    <Container
      maxW="container.lg"
      height={`calc(100vh - ${NAVBAR_HEIGHT}px)`}
      pb="20px"
    >
      <DialogTree treeName={treeName!} onEnd={navigateToNextScene} />
    </Container>
  );
}
