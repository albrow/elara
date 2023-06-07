import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouteNode } from "react-router5";

import { Sound } from "../lib/playables/sound";
import { Playable } from "../lib/playables";
import { RoundRobinSoundGroup } from "../lib/playables/round_robin";

import bumpSound0 from "../audio/bump_0.ogg";
import bumpSound1 from "../audio/bump_1.ogg";
import moveSound0 from "../audio/move_0.ogg";
import moveSound1 from "../audio/move_1.ogg";
import moveSound2 from "../audio/move_2.ogg";
import moveSound3 from "../audio/move_3.ogg";
import turnSound0 from "../audio/turn_0.ogg";
import turnSound1 from "../audio/turn_1.ogg";
import turnSound2 from "../audio/turn_2.ogg";
import turnSound3 from "../audio/turn_3.ogg";
import bumpSound0Fallback from "../audio/bump_0.mp3";
import bumpSound1Fallback from "../audio/bump_1.mp3";
import moveSound0Fallback from "../audio/move_0.mp3";
import moveSound1Fallback from "../audio/move_1.mp3";
import moveSound2Fallback from "../audio/move_2.mp3";
import moveSound3Fallback from "../audio/move_3.mp3";
import turnSound0Fallback from "../audio/turn_0.mp3";
import turnSound1Fallback from "../audio/turn_1.mp3";
import turnSound2Fallback from "../audio/turn_2.mp3";
import turnSound3Fallback from "../audio/turn_3.mp3";
import teleportSound from "../audio/teleport.ogg";
import teleportSoundFallback from "../audio/teleport.mp3";
import speakSound0 from "../audio/speak_0.ogg";
import speakSound1 from "../audio/speak_1.ogg";
import speakSound2 from "../audio/speak_2.ogg";
import speakSound3 from "../audio/speak_3.ogg";
import speakSound0Fallback from "../audio/speak_0.mp3";
import speakSound1Fallback from "../audio/speak_1.mp3";
import speakSound2Fallback from "../audio/speak_2.mp3";
import speakSound3Fallback from "../audio/speak_3.mp3";
import { useSaveData } from "../hooks/save_data_hooks";

interface SoundManager {
  getSound: (id: string) => Playable;
  playSound: (id: string) => void;
  stopAllSoundEffects: () => void;
  setMasterGain: (gain: number) => void;
  setSoundEffectsGain: (gain: number) => void;
}

export const SoundManagerContext = createContext<SoundManager>({
  getSound: () => {
    throw new Error("SoundManagerContext not initialized");
  },
  playSound: () => {
    throw new Error("SoundManagerContext not initialized");
  },
  stopAllSoundEffects: () => {
    throw new Error("SoundManagerContext not initialized");
  },
  setMasterGain: () => {
    throw new Error("SoundManagerContext not initialized");
  },
  setSoundEffectsGain: () => {
    throw new Error("SoundManagerContext not initialized");
  },
});

export function SoundProvider(props: PropsWithChildren<{}>) {
  const [saveData, _] = useSaveData();

  // Load master and group volume from settings.
  const [masterGain, setMasterGain] = useState(saveData.settings.masterVolume);
  const [relSfxGain, setRelSfxGain] = useState(
    saveData.settings.soundEffectsVolume
  );
  useEffect(() => {
    // Automatically update gains when the settings change.
    setMasterGain(saveData.settings.masterVolume);
    setRelSfxGain(saveData.settings.soundEffectsVolume);
  }, [saveData.settings.masterVolume, saveData.settings.soundEffectsVolume]);
  const sfxGain = useMemo(
    () => masterGain * relSfxGain,
    [masterGain, relSfxGain]
  );

  // TODO(albrow): Sfx for reading data, collecting fuel,
  // opening gates, being destroyed/attacked by malfunctioning rover.
  const soundDict: Record<string, Playable> = useMemo(
    () => ({
      move: new RoundRobinSoundGroup("move", [
        new Sound("move_0", [moveSound0, moveSound0Fallback], 0.3),
        new Sound("move_1", [moveSound1, moveSound1Fallback], 0.3),
        new Sound("move_2", [moveSound2, moveSound2Fallback], 0.3),
        new Sound("move_3", [moveSound3, moveSound3Fallback], 0.3),
      ]),
      turn: new RoundRobinSoundGroup("turn", [
        new Sound("turn_0", [turnSound0, turnSound0Fallback], 0.3),
        new Sound("turn_1", [turnSound1, turnSound1Fallback], 0.3),
        new Sound("turn_2", [turnSound2, turnSound2Fallback], 0.3),
        new Sound("turn_3", [turnSound3, turnSound3Fallback], 0.3),
      ]),
      bump: new RoundRobinSoundGroup("bump", [
        new Sound("bump_0", [bumpSound0, bumpSound0Fallback], 0.3),
        new Sound("bump_1", [bumpSound1, bumpSound1Fallback], 0.3),
      ]),
      teleport: new Sound(
        "teleport",
        [teleportSound, teleportSoundFallback],
        0.7
      ),
      speak: new RoundRobinSoundGroup("speak", [
        new Sound("speak_0", [speakSound0, speakSound0Fallback], 0.15),
        new Sound("speak_1", [speakSound1, speakSound1Fallback], 0.15),
        new Sound("speak_2", [speakSound2, speakSound2Fallback], 0.15),
        new Sound("speak_3", [speakSound3, speakSound3Fallback], 0.15),
      ]),
    }),
    []
  );
  useEffect(() => {
    Object.values(soundDict).forEach((sound) => {
      sound.setGroupGain(sfxGain);
    });
  }, [sfxGain, soundDict]);

  // getSound is used when you need more control over the sound (e.g. need
  // to play, pause, stop, or add effects).
  const getSound = useCallback(
    (id: string) => {
      if (!(id in soundDict)) {
        throw new Error(`Sound "${id}" not found`);
      }
      return soundDict[id];
    },
    [soundDict]
  );

  // playSound is used when you just need to play the sound and you don't care
  // about controlling it.
  const playSound = useCallback(
    (id: string) => {
      const sound = getSound(id);
      sound.play();
    },
    [getSound]
  );

  const stopAllSoundEffects = useCallback(() => {
    Object.values(soundDict).forEach((sound) => {
      sound.stop();
    });
  }, [soundDict]);

  // When the route changes, stop all sound effects.
  const { route } = useRouteNode("");
  useEffect(() => {
    stopAllSoundEffects();
  }, [route, stopAllSoundEffects]);

  const providerValue = useMemo(
    () => ({
      getSound,
      playSound,
      stopAllSoundEffects,
      setMasterGain,
      setSoundEffectsGain: setRelSfxGain,
    }),
    [getSound, playSound, stopAllSoundEffects, setMasterGain, setRelSfxGain]
  );

  return (
    <SoundManagerContext.Provider value={providerValue}>
      {props.children}
    </SoundManagerContext.Provider>
  );
}
