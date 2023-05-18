/* eslint-disable jsx-a11y/media-has-caption */
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
import teleportSound from "../audio/teleport.ogg";
import speakSound0 from "../audio/speak_0.ogg";
import speakSound1 from "../audio/speak_1.ogg";
import speakSound2 from "../audio/speak_2.ogg";
import speakSound3 from "../audio/speak_3.ogg";

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

  // Create master and group gain controls
  const [masterGain, setMasterGain] = useState(1.0);
  const [relSfxGain, setRelSfxGain] = useState(1.0);
  const sfxGain = useMemo(
    () => masterGain * relSfxGain,
    [masterGain, relSfxGain]
  );

  // TODO(albrow): Sfx for reading data, collecting fuel,
  // opening gates, being destroyed/attacked by malfunctioning rover.
  const soundDict: Record<string, Playable> = useMemo(
    () => ({
      move: new RoundRobinSoundGroup("move", [
        new Sound(audioContext, "move_0", moveRef0, 0.3, sfxGain),
        new Sound(audioContext, "move_1", moveRef1, 0.3, sfxGain),
        new Sound(audioContext, "move_2", moveRef2, 0.3, sfxGain),
        new Sound(audioContext, "move_3", moveRef3, 0.3, sfxGain),
      ]),
      turn: new RoundRobinSoundGroup("turn", [
        new Sound(audioContext, "turn_0", turnRef0, 0.3, sfxGain),
        new Sound(audioContext, "turn_1", turnRef1, 0.3, sfxGain),
        new Sound(audioContext, "turn_2", turnRef2, 0.3, sfxGain),
        new Sound(audioContext, "turn_3", turnRef3, 0.3, sfxGain),
      ]),
      bump: new RoundRobinSoundGroup("bump", [
        new Sound(audioContext, "bump_0", bumpRef0, 0.3, sfxGain),
        new Sound(audioContext, "bump_1", bumpRef1, 0.3, sfxGain),
      ]),
      teleport: new Sound(audioContext, "teleport", teleportRef, 0.7, sfxGain),
      speak: new RoundRobinSoundGroup("speak", [
        new Sound(audioContext, "speak_0", speakRef0, 0.25, sfxGain),
        new Sound(audioContext, "speak_3", speakRef3, 0.25, sfxGain),
        new Sound(audioContext, "speak_1", speakRef1, 0.25, sfxGain),
        new Sound(audioContext, "speak_2", speakRef2, 0.25, sfxGain),
      ]),
    }),
    [sfxGain]
  );

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
      <audio src={bumpSound0} ref={bumpRef0} preload="auto" />
      <audio src={bumpSound1} ref={bumpRef1} preload="auto" />
      <audio src={moveSound0} ref={moveRef0} preload="auto" />
      <audio src={moveSound1} ref={moveRef1} preload="auto" />
      <audio src={moveSound2} ref={moveRef2} preload="auto" />
      <audio src={moveSound3} ref={moveRef3} preload="auto" />
      <audio src={turnSound0} ref={turnRef0} preload="auto" />
      <audio src={turnSound1} ref={turnRef1} preload="auto" />
      <audio src={turnSound2} ref={turnRef2} preload="auto" />
      <audio src={turnSound3} ref={turnRef3} preload="auto" />
      <audio src={teleportSound} ref={teleportRef} preload="auto" />
      <audio src={speakSound0} ref={speakRef0} preload="auto" />
      <audio src={speakSound1} ref={speakRef1} preload="auto" />
      <audio src={speakSound2} ref={speakRef2} preload="auto" />
      <audio src={speakSound3} ref={speakRef3} preload="auto" />

      {props.children}
    </SoundManagerContext.Provider>
  );
}
