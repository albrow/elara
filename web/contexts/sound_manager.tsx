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

import bumpSound0 from "../audio/sfx/bump_0.ogg";
import bumpSound1 from "../audio/sfx/bump_1.ogg";
import moveSound0 from "../audio/sfx/move_0.ogg";
import moveSound1 from "../audio/sfx/move_1.ogg";
import moveSound2 from "../audio/sfx/move_2.ogg";
import moveSound3 from "../audio/sfx/move_3.ogg";
import turnSound0 from "../audio/sfx/turn_0.ogg";
import turnSound1 from "../audio/sfx/turn_1.ogg";
import turnSound2 from "../audio/sfx/turn_2.ogg";
import turnSound3 from "../audio/sfx/turn_3.ogg";
import bumpSound0Fallback from "../audio/sfx/bump_0.mp3";
import bumpSound1Fallback from "../audio/sfx/bump_1.mp3";
import moveSound0Fallback from "../audio/sfx/move_0.mp3";
import moveSound1Fallback from "../audio/sfx/move_1.mp3";
import moveSound2Fallback from "../audio/sfx/move_2.mp3";
import moveSound3Fallback from "../audio/sfx/move_3.mp3";
import turnSound0Fallback from "../audio/sfx/turn_0.mp3";
import turnSound1Fallback from "../audio/sfx/turn_1.mp3";
import turnSound2Fallback from "../audio/sfx/turn_2.mp3";
import turnSound3Fallback from "../audio/sfx/turn_3.mp3";
import teleportSound from "../audio/sfx/teleport.ogg";
import teleportSoundFallback from "../audio/sfx/teleport.mp3";
import speakSound0 from "../audio/sfx/speak_0.ogg";
import speakSound1 from "../audio/sfx/speak_1.ogg";
import speakSound2 from "../audio/sfx/speak_2.ogg";
import speakSound3 from "../audio/sfx/speak_3.ogg";
import speakSound0Fallback from "../audio/sfx/speak_0.mp3";
import speakSound1Fallback from "../audio/sfx/speak_1.mp3";
import speakSound2Fallback from "../audio/sfx/speak_2.mp3";
import speakSound3Fallback from "../audio/sfx/speak_3.mp3";
import successSound from "../audio/sfx/success.ogg";
import successSoundFallback from "../audio/sfx/success.mp3";
import challengeSound from "../audio/sfx/challenge.ogg";
import challengeSoundFallback from "../audio/sfx/challenge.mp3";
import buttonPressOn from "../audio/sfx/button_press_on.ogg";
import buttonPressOff from "../audio/sfx/button_press_off.ogg";
import buttonPressOnFallback from "../audio/sfx/button_press_on.mp3";
import buttonPressOffFallback from "../audio/sfx/button_press_off.mp3";
import intro from "../audio/dialog/intro.ogg";
import introFallback from "../audio/dialog/intro.mp3";
import journeyNegResponse from "../audio/dialog/journey_neg_response.ogg";
import journeyNegResponseFallback from "../audio/dialog/journey_neg_response.mp3";
import journeyPosResponse from "../audio/dialog/journey_pos_response.ogg";
import journeyPosResponseFallback from "../audio/dialog/journey_pos_response.mp3";
import whereIam from "../audio/dialog/where_i_am.ogg";
import whereIamFallback from "../audio/dialog/where_i_am.mp3";
import whoIam from "../audio/dialog/who_i_am.ogg";
import whoIamFallback from "../audio/dialog/who_i_am.mp3";
import whereYouAre from "../audio/dialog/where_you_are.ogg";
import whereYouAreFallback from "../audio/dialog/where_you_are.mp3";

import { useSaveData } from "../hooks/save_data_hooks";
import { volumeToGain } from "../lib/utils";

interface SoundManager {
  getSound: (id: string) => Playable;
  getSoundOrNull: (id: string) => Playable | null;
  playSound: (id: string) => void;
  stopAllSoundEffects: () => void;
}

export const SoundManagerContext = createContext<SoundManager>({
  getSound: () => {
    throw new Error("SoundManagerContext not initialized");
  },
  getSoundOrNull: () => {
    throw new Error("SoundManagerContext not initialized");
  },
  playSound: () => {
    throw new Error("SoundManagerContext not initialized");
  },
  stopAllSoundEffects: () => {
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
  const [relDialogGain, setRelDialogGain] = useState(
    saveData.settings.dialogVolume
  );

  // Recalculate relative and total gains whenever the settings change.
  useEffect(() => {
    setMasterGain(saveData.settings.masterVolume);
    setRelSfxGain(saveData.settings.soundEffectsVolume);
    setRelDialogGain(saveData.settings.dialogVolume);
  }, [
    saveData.settings.dialogVolume,
    saveData.settings.masterVolume,
    saveData.settings.soundEffectsVolume,
  ]);
  const sfxGain = useMemo(
    () => volumeToGain(masterGain * relSfxGain),
    [masterGain, relSfxGain]
  );
  const dialogGain = useMemo(
    () => volumeToGain(masterGain * relDialogGain),
    [masterGain, relDialogGain]
  );

  // TODO(albrow): Sfx for reading data, collecting energy cells,
  // opening gates, being destroyed/attacked by malfunctioning rover.
  const soundDict: Record<string, Playable> = useMemo(
    () => ({
      move: new RoundRobinSoundGroup("move", [
        new Sound("move_0", "sfx", [moveSound0, moveSound0Fallback], 0.4),
        new Sound("move_1", "sfx", [moveSound1, moveSound1Fallback], 0.4),
        new Sound("move_2", "sfx", [moveSound2, moveSound2Fallback], 0.4),
        new Sound("move_3", "sfx", [moveSound3, moveSound3Fallback], 0.4),
      ]),
      turn: new RoundRobinSoundGroup("turn", [
        new Sound("turn_0", "sfx", [turnSound0, turnSound0Fallback], 0.4),
        new Sound("turn_1", "sfx", [turnSound1, turnSound1Fallback], 0.4),
        new Sound("turn_2", "sfx", [turnSound2, turnSound2Fallback], 0.4),
        new Sound("turn_3", "sfx", [turnSound3, turnSound3Fallback], 0.4),
      ]),
      bump: new RoundRobinSoundGroup("bump", [
        new Sound("bump_0", "sfx", [bumpSound0, bumpSound0Fallback], 0.4),
        new Sound("bump_1", "sfx", [bumpSound1, bumpSound1Fallback], 0.4),
      ]),
      teleport: new Sound(
        "teleport",
        "sfx",
        [teleportSound, teleportSoundFallback],
        0.7
      ),
      speak: new RoundRobinSoundGroup("speak", [
        new Sound("speak_0", "sfx", [speakSound0, speakSound0Fallback], 0.08),
        new Sound("speak_1", "sfx", [speakSound1, speakSound1Fallback], 0.08),
        new Sound("speak_2", "sfx", [speakSound2, speakSound2Fallback], 0.08),
        new Sound("speak_3", "sfx", [speakSound3, speakSound3Fallback], 0.08),
      ]),
      button_press_on: new Sound(
        "button_press_on",
        "sfx",
        [buttonPressOn, buttonPressOnFallback],
        0.8
      ),
      button_press_off: new Sound(
        "button_press_off",
        "sfx",
        [buttonPressOff, buttonPressOffFallback],
        0.8
      ),
      success: new Sound(
        "success",
        "sfx",
        [successSound, successSoundFallback],
        1.0
      ),
      challenge: new Sound(
        "challenge",
        "sfx",
        [challengeSound, challengeSoundFallback],
        0.8
      ),
      dialog_intro: new Sound(
        "dialog_intro",
        "dialog",
        [intro, introFallback],
        0.8
      ),
      dialog_journey_neg_response: new Sound(
        "dialog_journey_neg_response",
        "dialog",
        [journeyNegResponse, journeyNegResponseFallback],
        0.8
      ),
      dialog_journey_pos_response: new Sound(
        "dialog_journey_pos_response",
        "dialog",
        [journeyPosResponse, journeyPosResponseFallback],
        0.8
      ),
      dialog_where_i_am: new Sound(
        "dialog_where_i_am",
        "dialog",
        [whereIam, whereIamFallback],
        0.8
      ),
      dialog_who_i_am: new Sound(
        "dialog_who_i_am",
        "dialog",
        [whoIam, whoIamFallback],
        0.8
      ),
      dialog_where_you_are: new Sound(
        "dialog_where_you_are",
        "dialog",
        [whereYouAre, whereYouAreFallback],
        0.8
      ),
    }),
    []
  );

  // Update the gain for each sound whenever the master gain or category gains change.
  useEffect(() => {
    Object.values(soundDict)
      .filter((sound) => sound.category === "sfx")
      .forEach((sound) => {
        sound.setCatGain(sfxGain);
      });
  }, [sfxGain, soundDict]);
  useEffect(() => {
    Object.values(soundDict)
      .filter((sound) => sound.category === "dialog")
      .forEach((sound) => {
        sound.setCatGain(dialogGain);
      });
  }, [dialogGain, soundDict]);

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

  // Similar to getSound but returns null instead of throwing an error
  // if the sound does not exist.
  const getSoundOrNull = useCallback(
    (id: string) => {
      if (!(id in soundDict)) {
        return null;
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

  // When the route changes, we always want to stop all sound effects.
  const { route } = useRouteNode("");
  useEffect(() => {
    stopAllSoundEffects();
  }, [route, stopAllSoundEffects]);

  const providerValue = useMemo(
    () => ({
      getSound,
      getSoundOrNull,
      playSound,
      stopAllSoundEffects,
    }),
    [getSound, getSoundOrNull, playSound, stopAllSoundEffects]
  );

  return (
    <SoundManagerContext.Provider value={providerValue}>
      {props.children}
    </SoundManagerContext.Provider>
  );
}
