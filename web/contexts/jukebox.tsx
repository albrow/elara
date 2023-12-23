import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSaveData } from "../hooks/save_data_hooks";
import { Playable } from "../lib/playables";
import { Sound } from "../lib/playables/sound";
import { volumeToGain } from "../lib/utils";
import { MUSIC_FADE_OUT_TIME_MS } from "../lib/constants";

import prelude from "../audio/music/prelude.ogg";
import preludeFallback from "../audio/music/prelude.mp3";
import gettingOffTheGround from "../audio/music/getting_off_the_ground.ogg";
import gettingOffTheGroundFallback from "../audio/music/getting_off_the_ground.mp3";
import driftingIntoSpace from "../audio/music/drifting_into_space.ogg";
import driftingIntoSpaceFallback from "../audio/music/drifting_into_space.mp3";
import lookingAhead from "../audio/music/looking_ahead.ogg";
import lookingAheadFallback from "../audio/music/looking_ahead.mp3";
import measuringTheChallenge from "../audio/music/measuring_the_challenge.ogg";
import measuringTheChallengeFallback from "../audio/music/measuring_the_challenge.mp3";
import puttingItAllTogether from "../audio/music/putting_it_all_together.ogg";
import puttingItAllTogetherFallback from "../audio/music/putting_it_all_together.mp3";
import notTheEnd from "../audio/music/not_the_end.ogg";
import notTheEndFallback from "../audio/music/not_the_end.mp3";
import hubAmbience from "../audio/music/hub_ambience.ogg";
import hubAmbienceFallback from "../audio/music/hub_ambience.mp3";

/** How much to lower the music volume temporarily when ducking is enabled. */
const DUCK_LEVEL = 0.5;
/**
 * How many songs should be loaded in memory before we start unloading them.
 * Why set this to anything greater than 1? It helps reduce thrashing when going
 * back and forth between two songs, e.g., as is typical when transitioning
 * between the hub and a level. Thrashing would result in unnecessary network requests.
 */
const MAX_SONGS_IN_MEMORY = 4;

interface Jukebox {
  requestSong: (id: string) => void;
  stopSong: (id: string) => void;
  stopAllMusic: (fadeOut?: number) => void;
  duckMusic: () => void;
  unduckMusic: () => void;
}

export const JukeboxContext = createContext<Jukebox>({
  requestSong: () => {
    throw new Error("JukeboxContext not initialized");
  },
  stopSong: () => {
    throw new Error("JukeboxContext not initialized");
  },
  stopAllMusic: () => {
    throw new Error("JukeboxContext not initialized");
  },
  duckMusic: () => {
    throw new Error("JukeboxContext not initialized");
  },
  unduckMusic: () => {
    throw new Error("JukeboxContext not initialized");
  },
});

export function JukeboxProvider(props: PropsWithChildren<{}>) {
  const [saveData] = useSaveData();
  const [masterGain, setMasterGain] = useState(saveData.settings.masterVolume);
  const [relMusicGain, setRelMusicGain] = useState(
    saveData.settings.musicVolume
  );
  // tempMusicGain is used for ducking (i.e. temporary volume reduction)
  const [tempMusicGain, setTempMusicGain] = useState(1.0);
  // timeout used to transition between songs
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null);

  // Recalculate music volume/gain whenever the settings change.
  useEffect(() => {
    setMasterGain(saveData.settings.masterVolume);
    setRelMusicGain(saveData.settings.musicVolume);
  }, [saveData.settings.masterVolume, saveData.settings.musicVolume]);
  const musicGain = useMemo(
    () => volumeToGain(masterGain * relMusicGain * tempMusicGain),
    [masterGain, relMusicGain, tempMusicGain]
  );
  useEffect(() => {
    setRelMusicGain(saveData.settings.musicVolume);
  }, [saveData.settings.musicVolume]);

  /**
   * Keeps track of recently played songs in a queue. This is so we know
   * which songs to unload when we need to free up memory.
   * _unsafeSetRecentlyPlayedSongs should not be called directly. Instead
   * use pushRecentlyPlayedSong.
   */
  const [_, _unsafeSetRecentlyPlayedSongs] = useState<string[]>([]);

  const musicDict: Record<string, Playable> = useMemo(
    () => ({
      prelude: new Sound("prelude", "music", [prelude, preludeFallback], {
        loop: true,
        fadeIn: 4000,
        preload: false,
      }),
      gettingOffTheGround: new Sound(
        "gettingOffTheGround",
        "music",
        [gettingOffTheGround, gettingOffTheGroundFallback],
        {
          loop: true,
          fadeIn: 10,
          preload: false,
          stream: true,
        }
      ),
      driftingIntoSpace: new Sound(
        "driftingIntoSpace",
        "music",
        [driftingIntoSpace, driftingIntoSpaceFallback],
        {
          loop: true,
          fadeIn: 10,
          preload: false,
          // Note: this somg seamlessly loops, so we can't stream it.
        }
      ),
      lookingAhead: new Sound(
        "lookingAhead",
        "music",
        [lookingAhead, lookingAheadFallback],
        {
          loop: true,
          fadeIn: 10,
          preload: false,
          stream: true,
        }
      ),
      measuringTheChallenge: new Sound(
        "measuringTheChallenge",
        "music",
        [measuringTheChallenge, measuringTheChallengeFallback],
        {
          loop: true,
          fadeIn: 10,
          preload: false,
          stream: true,
        }
      ),
      puttingItAllTogether: new Sound(
        "puttingItAllTogether",
        "music",
        [puttingItAllTogether, puttingItAllTogetherFallback],
        {
          loop: true,
          fadeIn: 10,
          preload: false,
          stream: true,
        }
      ),
      notTheEnd: new Sound(
        "notTheEnd",
        "music",
        [notTheEnd, notTheEndFallback],
        {
          loop: true,
          fadeIn: 10,
          preload: false,
          stream: true,
        }
      ),
      hubAmbience: new Sound(
        "hubAmbience",
        "music",
        [hubAmbience, hubAmbienceFallback],
        {
          baseGain: 3.0,
          loop: true,
          fadeIn: 1000,
          preload: false,
          stream: false,
        }
      ),
    }),
    []
  );

  const pushRecentlyPlayedSong = useCallback(
    (id: string) => {
      _unsafeSetRecentlyPlayedSongs((prev) => {
        let next = [...prev];
        next.push(id);

        // Remove duplicates while preserving order and recency.
        next = next
          .reverse()
          .filter((item, index) => next.indexOf(item) === index)
          .reverse();

        // Remove the oldest song if we've exceeded the max.
        if (next.length > MAX_SONGS_IN_MEMORY) {
          const oldSong = next.shift();
          if (oldSong) {
            musicDict[oldSong].unload();
          }
        }
        return next;
      });
    },
    [musicDict]
  );

  const currentlyPlaying = useCallback(() => {
    // Iterate through muscDict to find which song is currently playing.
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, song] of Object.entries(musicDict)) {
      if (song.isPlaying()) {
        return id;
      }
    }
    return null;
  }, [musicDict]);

  // Automatically respond to changes in musicGain.
  useEffect(() => {
    Object.values(musicDict)
      .filter((sound) => sound.category === "music")
      .forEach((sound) => {
        sound.setCatGain(musicGain);
      });
  }, [musicGain, musicDict]);

  const stopAllMusic = useCallback(
    (fadeOut?: number) => {
      Object.values(musicDict)
        .filter((sound) => sound.category === "music")
        .forEach((sound) => {
          if (sound.isPlaying()) {
            sound.stop(fadeOut);
          }
        });
    },
    [musicDict]
  );

  const requestSong = useCallback(
    (id: string) => {
      if (musicDict[id] == null) {
        throw new Error(`No song with id ${id}`);
      }
      if (currentlyPlaying() === id) {
        return;
      }
      const song = musicDict[id];
      if (currentlyPlaying() !== null) {
        stopAllMusic(MUSIC_FADE_OUT_TIME_MS);
        if (transitionTimeout.current) {
          clearTimeout(transitionTimeout.current);
        }
        transitionTimeout.current = setTimeout(() => {
          song.play();
        }, MUSIC_FADE_OUT_TIME_MS);
      } else {
        song.play();
      }
      pushRecentlyPlayedSong(id);
    },
    [currentlyPlaying, musicDict, pushRecentlyPlayedSong, stopAllMusic]
  );

  const stopSong = useCallback(
    (id: string) => {
      if (id in musicDict) {
        const song = musicDict[id];
        song.stop();
      } else {
        throw new Error(`No song with id ${id}`);
      }
    },
    [musicDict]
  );

  const duckMusic = useCallback(() => {
    setTempMusicGain(DUCK_LEVEL);
  }, []);

  const unduckMusic = useCallback(() => {
    setTempMusicGain(1.0);
  }, []);

  const providerValue = useMemo(
    () => ({
      requestSong,
      stopSong,
      stopAllMusic,
      duckMusic,
      unduckMusic,
    }),
    [requestSong, stopSong, duckMusic, stopAllMusic, unduckMusic]
  );

  return (
    <JukeboxContext.Provider value={providerValue}>
      {props.children}
    </JukeboxContext.Provider>
  );
}
