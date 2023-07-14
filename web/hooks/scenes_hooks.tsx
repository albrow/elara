import { useContext, useState, useEffect, useCallback } from "react";
import { useRouteNode, useRouter } from "react-router5";
import type { State } from "router5";

import { ScenesContext, Scene } from "../contexts/scenes";

function getSceneIndexFromRoute(
  scenes: Scene[],
  route: State
): number | undefined {
  const givenParamsJSON = JSON.stringify(route.params);
  return scenes.findIndex(
    (scene) =>
      scene.routeName === route.name &&
      JSON.stringify(scene.routeParams) === givenParamsJSON
  );
}

function getSceneFromRoute(scenes: Scene[], route: State): Scene | null {
  const index = getSceneIndexFromRoute(scenes, route);
  if (index === undefined) {
    return null;
  }
  return scenes[index];
}

// A custom hook that returns all scenes.
export const useScenes = () => useContext(ScenesContext);

// A custom hook that returns only the level scenes.
export const useLevels = () =>
  useContext(ScenesContext).filter((s) => s.type === "level");

// A custom hook that returns only the journal scenes.
export const useJournalPages = () =>
  useContext(ScenesContext).filter((s) => s.type === "journal");

// A custom hook that always returns the current scene.
export function useCurrScene() {
  const scenes = useScenes();
  const { route } = useRouteNode("");
  const [currScene, setCurrScene] = useState<Scene | null>(
    getSceneFromRoute(scenes, route)
  );
  useEffect(() => {
    setCurrScene(getSceneFromRoute(scenes, route));
  }, [route, scenes]);

  return currScene;
}

// A custom hook that allows for navigating between scenes.
export function useSceneNavigator() {
  const currScene = useCurrScene();
  const router = useRouter();
  const JOURNAL_PAGES = useJournalPages();

  const navigateToNextScene = useCallback(() => {
    if (!currScene) {
      throw new Error("Could not get current scene.");
    }
    const { nextScene } = currScene;
    if (nextScene == null) {
      throw new Error("Could not get next scene.");
    }
    router.navigate(nextScene.routeName, nextScene.routeParams ?? {});
  }, [currScene, router]);

  const navigateToHub = useCallback(() => {
    router.navigate("hub");
  }, [router]);

  const navigateToNextJournalPage = useCallback(() => {
    const unlockedPages = JOURNAL_PAGES.filter((page) => page.unlocked);
    if (unlockedPages.length === 0) {
      throw new Error("Could not find any unlocked journal pages.");
    }
    const unlockedAndUnseenPages = unlockedPages.filter(
      (page) => !page.completed
    );
    const newestPage =
      unlockedAndUnseenPages.length > 0
        ? unlockedAndUnseenPages[0]
        : unlockedPages[unlockedPages.length - 1];
    router.navigate(newestPage.routeName, newestPage.routeParams ?? {});
  }, [JOURNAL_PAGES, router]);

  return { navigateToNextScene, navigateToHub, navigateToNextJournalPage };
}

// A custom hook that returns the current level or, if the current
// scene is not a level returns null.
export function useCurrLevel() {
  const currScene = useCurrScene();
  if (!currScene) {
    return null;
  }
  if (currScene.type === "level") {
    return currScene.level;
  }
  return null;
}
