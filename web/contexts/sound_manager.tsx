import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouteNode } from "react-router5";

import { Sound } from "../lib/playables/sound";
import { Playable } from "../lib/playables";
import { RoundRobinSoundGroup } from "../lib/playables/round_robin";
import { AudioWithFallback } from "../components/audio_with_fallback";

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
import { useSaveData } from "./save_data";

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

const audioContext = new AudioContext({
  sampleRate: 48000,
  latencyHint: "interactive",
});

export const useSoundManager = () => useContext(SoundManagerContext);

export function SoundProvider(props: PropsWithChildren<{}>) {
  const [saveData, _] = useSaveData();

  const bumpRef0 = useRef<HTMLAudioElement>(null);
  const bumpRef1 = useRef<HTMLAudioElement>(null);
  const moveRef0 = useRef<HTMLAudioElement>(null);
  const moveRef1 = useRef<HTMLAudioElement>(null);
  const moveRef2 = useRef<HTMLAudioElement>(null);
  const moveRef3 = useRef<HTMLAudioElement>(null);
  const turnRef0 = useRef<HTMLAudioElement>(null);
  const turnRef1 = useRef<HTMLAudioElement>(null);
  const turnRef2 = useRef<HTMLAudioElement>(null);
  const turnRef3 = useRef<HTMLAudioElement>(null);
  const teleportRef = useRef<HTMLAudioElement>(null);
  const speakRef0 = useRef<HTMLAudioElement>(null);
  const speakRef1 = useRef<HTMLAudioElement>(null);
  const speakRef2 = useRef<HTMLAudioElement>(null);
  const speakRef3 = useRef<HTMLAudioElement>(null);

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
        new Sound(audioContext, "move_0", moveRef0, 0.3),
        new Sound(audioContext, "move_1", moveRef1, 0.3),
        new Sound(audioContext, "move_2", moveRef2, 0.3),
        new Sound(audioContext, "move_3", moveRef3, 0.3),
      ]),
      turn: new RoundRobinSoundGroup("turn", [
        new Sound(audioContext, "turn_0", turnRef0, 0.3),
        new Sound(audioContext, "turn_1", turnRef1, 0.3),
        new Sound(audioContext, "turn_2", turnRef2, 0.3),
        new Sound(audioContext, "turn_3", turnRef3, 0.3),
      ]),
      bump: new RoundRobinSoundGroup("bump", [
        new Sound(audioContext, "bump_0", bumpRef0, 0.3),
        new Sound(audioContext, "bump_1", bumpRef1, 0.3),
      ]),
      teleport: new Sound(audioContext, "teleport", teleportRef, 0.7),
      speak: new RoundRobinSoundGroup("speak", [
        new Sound(audioContext, "speak_0", speakRef0, 0.15),
        new Sound(audioContext, "speak_3", speakRef3, 0.3),
        new Sound(audioContext, "speak_1", speakRef1, 0.15),
        new Sound(audioContext, "speak_2", speakRef2, 0.3),
      ]),
    }),
    []
  );
  useEffect(() => {
    Object.values(soundDict).forEach((sound) => {
      sound.setGroupGain(sfxGain);
    });
  }, [sfxGain, soundDict]);

  // Attempt to preemptively load all sounds.
  useEffect(() => {
    Object.values(soundDict).forEach((sound) => {
      sound.load();
    });
  }, [soundDict]);

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
      if (sound.isLoaded()) {
        sound.stop();
      }
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
      <AudioWithFallback
        ref={moveRef0}
        oggSrc={moveSound0}
        mp3Src={moveSound0Fallback}
      />
      <AudioWithFallback
        ref={moveRef1}
        oggSrc={moveSound1}
        mp3Src={moveSound1Fallback}
      />
      <AudioWithFallback
        ref={moveRef2}
        oggSrc={moveSound2}
        mp3Src={moveSound2Fallback}
      />
      <AudioWithFallback
        ref={moveRef3}
        oggSrc={moveSound3}
        mp3Src={moveSound3Fallback}
      />
      <AudioWithFallback
        ref={turnRef0}
        oggSrc={turnSound0}
        mp3Src={turnSound0Fallback}
      />
      <AudioWithFallback
        ref={turnRef1}
        oggSrc={turnSound1}
        mp3Src={turnSound1Fallback}
      />
      <AudioWithFallback
        ref={turnRef2}
        oggSrc={turnSound2}
        mp3Src={turnSound2Fallback}
      />
      <AudioWithFallback
        ref={turnRef3}
        oggSrc={turnSound3}
        mp3Src={turnSound3Fallback}
      />
      <AudioWithFallback
        ref={bumpRef0}
        oggSrc={bumpSound0}
        mp3Src={bumpSound0Fallback}
      />
      <AudioWithFallback
        ref={bumpRef1}
        oggSrc={bumpSound1}
        mp3Src={bumpSound1Fallback}
      />
      <AudioWithFallback
        ref={teleportRef}
        oggSrc={teleportSound}
        mp3Src={teleportSoundFallback}
      />
      <AudioWithFallback
        ref={speakRef0}
        oggSrc={speakSound0}
        mp3Src={speakSound0Fallback}
      />
      <AudioWithFallback
        ref={speakRef1}
        oggSrc={speakSound1}
        mp3Src={speakSound1Fallback}
      />
      <AudioWithFallback
        ref={speakRef2}
        oggSrc={speakSound2}
        mp3Src={speakSound2Fallback}
      />
      <AudioWithFallback
        ref={speakRef3}
        oggSrc={speakSound3}
        mp3Src={speakSound3Fallback}
      />

      {props.children}
    </SoundManagerContext.Provider>
  );
}
