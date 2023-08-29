import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSaveData } from "../hooks/save_data_hooks";
import prelude from "../audio/music/prelude.ogg";
import preludeFallback from "../audio/music/prelude.mp3";
import { Playable } from "../lib/playables";
import { Sound } from "../lib/playables/sound";
import { volumeToGain } from "../lib/utils";

// How much to lower the music volume temporarily when ducking is enabled.
const DUCK_LEVEL = 0.5;

interface Jukebox {
  requestSong: (id: string) => void;
  stopSong: (id: string) => void;
  stopAllMusic: () => void;
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
  const [masterGain] = useState(saveData.settings.masterVolume);
  const [relMusicGain, setRelMusicGain] = useState(
    saveData.settings.musicVolume
  );
  // tempMusicGain is used for ducking (i.e. temporary volume reduction)
  const [tempMusicGain, setTempMusicGain] = useState(1.0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const musicGain = useMemo(
    () => volumeToGain(masterGain * relMusicGain * tempMusicGain),
    [masterGain, relMusicGain, tempMusicGain]
  );
  useEffect(() => {
    setRelMusicGain(saveData.settings.musicVolume);
  }, [saveData.settings.musicVolume]);

  const musicDict: Record<string, Playable> = useMemo(
    () => ({
      prelude: new Sound(
        "prelude",
        "music",
        [prelude, preludeFallback],
        1.0,
        true,
        4000
      ),
    }),
    []
  );

  useEffect(() => {
    Object.values(musicDict)
      .filter((sound) => sound.category === "music")
      .forEach((sound) => {
        sound.setCatGain(musicGain);
      });
  }, [musicGain, musicDict]);

  const stopAllMusic = useCallback(() => {
    Object.values(musicDict)
      .filter((sound) => sound.category === "music")
      .forEach((sound) => {
        sound.stop();
      });
    setCurrentlyPlaying(null);
  }, [musicDict]);

  const requestSong = useCallback(
    (id: string) => {
      if (currentlyPlaying === id) {
        return;
      }
      if (id in musicDict) {
        stopAllMusic();
        const song = musicDict[id];
        song.play();
        setCurrentlyPlaying(id);
      } else {
        throw new Error(`No song with id ${id}`);
      }
    },
    [currentlyPlaying, musicDict, stopAllMusic]
  );

  const stopSong = useCallback(
    (id: string) => {
      if (id in musicDict) {
        const song = musicDict[id];
        song.stop();
        setCurrentlyPlaying(null);
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
