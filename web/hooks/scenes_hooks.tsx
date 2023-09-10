import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouteNode, useRouter } from "react-router5";
import type { State } from "router5";

import type { Scene } from "../contexts/scenes";
import { ScenesContext } from "../contexts/scenes";
import { MUSIC_FADE_OUT_TIME_MS, SOUND_DELAY_TIME_MS } from "../lib/constants";
import { useSoundManager } from "./sound_manager_hooks";
import { useSaveData } from "./save_data_hooks";
import { useJukebox } from "./jukebox_hooks";

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

// Returns the next/latest unlocked scene. This tells us what scene the
// player should go to next.
export function useNextUnlockedScene() {
  const scenes = useScenes();
  for (let i = scenes.length - 1; i >= 0; i -= 1) {
    if (scenes[i].unlocked) {
      return scenes[i];
    }
  }
  return scenes[0];
}

// A custom hook that allows for navigating between scenes.
export function useSceneNavigator() {
  const currScene = useCurrScene();
  const router = useRouter();
  const JOURNAL_PAGES = useJournalPages();
  const { getSoundOrNull } = useSoundManager();
  const soundTimeout = useRef<NodeJS.Timeout | null>(null);
  const musicTimeout = useRef<NodeJS.Timeout | null>(null);
  const [_, { unlockFunctions }] = useSaveData();
  const { requestSong, stopAllMusic } = useJukebox();

  const navigateToScene = useCallback(
    (scene: Scene) => {
      router.navigate(scene.routeName, scene.routeParams ?? {});

      // Check if the scene has an initial sound. If so, play it
      // after a short delay.
      if (scene.initialSound != null) {
        if (soundTimeout.current) {
          clearTimeout(soundTimeout.current);
        }
        const sound = getSoundOrNull(scene.initialSound);
        if (sound) {
          sound.stop();
          soundTimeout.current = setTimeout(() => sound.play(), 250);
        }
      }

      // Check if the scene has music. If so, play it after a short delay.
      if (scene.music != null) {
        if (musicTimeout.current) {
          clearTimeout(musicTimeout.current);
        }
        musicTimeout.current = setTimeout(() => {
          requestSong(scene.music!);
        }, SOUND_DELAY_TIME_MS);
      } else {
        stopAllMusic(MUSIC_FADE_OUT_TIME_MS);
      }

      // If the scene we're navigating too has any new functions to unlock,
      // unlock them.
      if (scene.newFunctions != null && scene.newFunctions.length > 0) {
        unlockFunctions(scene.newFunctions);
      }
    },
    [getSoundOrNull, requestSong, router, stopAllMusic, unlockFunctions]
  );

  const navigateToNextScene = useCallback(() => {
    if (!currScene) {
      throw new Error("Could not get current scene.");
    }
    const { nextScene } = currScene;
    if (nextScene == null) {
      throw new Error("Could not get next scene.");
    }
    navigateToScene(nextScene);
  }, [currScene, navigateToScene]);

  const navigateToHub = useCallback(() => {
    // TODO(albrow): Play ambient hub music.
    stopAllMusic(MUSIC_FADE_OUT_TIME_MS);
    router.navigate("hub");
  }, [router, stopAllMusic]);

  const navigateToTitle = useCallback(() => {
    router.navigate("title");
    let timeout: NodeJS.Timeout | null = null;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      requestSong("prelude");
    }, SOUND_DELAY_TIME_MS);
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [requestSong, router]);

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

    navigateToScene(newestPage);
  }, [JOURNAL_PAGES, navigateToScene]);

  const navigateToCutscene = useCallback(
    (cutsceneId: string) => {
      stopAllMusic(MUSIC_FADE_OUT_TIME_MS);
      router.navigate("cutscene", { cutsceneId });
    },
    [router, stopAllMusic]
  );

  return {
    navigateToScene,
    navigateToNextScene,
    navigateToHub,
    navigateToTitle,
    navigateToNextJournalPage,
    navigateToCutscene,
  };
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
