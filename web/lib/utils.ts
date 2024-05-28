import prettydate from "pretty-date";

import { LevelData } from "../../elara-lib/pkg/elara_lib";
import { SaveData } from "../contexts/save_data";
import type { Scene } from "../lib/scenes";

// Returns a read-only array of the given size.
export function range(size: number): ReadonlyArray<number> {
  return [...Array(size).keys()].map((i) => i);
}

// Async function which resolves after the given number of milliseconds.
export async function sleep(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ChallengeProgress {
  completed: number;
  available: number;
}

export function getChallengeProgress(
  levels: Map<string, LevelData>,
  saveData: SaveData
): ChallengeProgress {
  let completed = 0;
  let available = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const [levelName, levelState] of Object.entries(saveData.levelStates)) {
    if (levels.get(levelName)?.challenge !== "") {
      available += 1;
      if (levelState.challengeCompleted) {
        completed += 1;
      }
    }
  }

  return {
    completed,
    available,
  };
}

// Returns the next *level* that appears after the given scene, or
// undefined if scene is the last level.
export function getNextLevel(scene: Scene): Scene | undefined {
  let ptr = scene;
  while (ptr.nextScene !== undefined) {
    if (ptr.nextScene!.type === "level") {
      return ptr.nextScene;
    }
    ptr = ptr.nextScene;
  }
  return undefined;
}

// Returns the next *journal page* that appears after the given scene, or
// undefined if scene is the last journal page.
export function getNextJournalPage(scene: Scene): Scene | undefined {
  let ptr = scene;
  while (ptr.nextScene !== undefined) {
    if (ptr.nextScene!.type === "journal") {
      return ptr.nextScene;
    }
    ptr = ptr.nextScene;
  }
  return undefined;
}

// Converts a volume from 0 to 1 to an appropriately scaled gain value.
// Human perception of loudness is logarithmic, so this helps to make the
// volume slider "feel" more linear.
export function volumeToGain(volume: number): number {
  return (10 * volume ** 3) / 10;
}

const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 1000;

export function humanFriendlyTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff <= TWELVE_HOURS_IN_MS) {
    return prettydate.format(new Date(timestamp));
  }
  const date = new Date(timestamp);
  const dayMonthYear = date.toLocaleDateString("en-us", {
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    month: "short",
    day: "numeric",
  });
  return `${dayMonthYear} at ${date.toLocaleTimeString("en-us", {
    hour: "numeric",
    minute: "numeric",
  })}`;
}

export function getYouTubeEmbedURLFromId(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}

export function getVimeoEmbedURLFromId(id: number): string {
  return `https://player.vimeo.com/video/${id}`;
}

/**
 * Returns a URL to a local video file, or null if the build target does not support local video URLs.
 *
 * @param name The name of the video file, without the extension.
 * @returns A URL to the video file, or null if the build target does not support local video URLs.
 */
export function getLocalVideoUrl(name: string): string | null {
  if (ELARA_BUILD_TARGET === "electron") {
    return new URL(`../videos/${name}.mp4`, import.meta.url).href;
  }
  return null;
}
