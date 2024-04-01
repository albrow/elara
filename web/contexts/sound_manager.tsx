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
import readingData from "../audio/sfx/reading_data.ogg";
import readingDataFallback from "../audio/sfx/reading_data.mp3";
import successSound from "../audio/sfx/success.ogg";
import successSoundFallback from "../audio/sfx/success.mp3";
import challengeSound from "../audio/sfx/challenge.ogg";
import challengeSoundFallback from "../audio/sfx/challenge.mp3";
import buttonPressOn from "../audio/sfx/button_press_on.ogg";
import buttonPressOff from "../audio/sfx/button_press_off.ogg";
import buttonPressOnFallback from "../audio/sfx/button_press_on.mp3";
import buttonPressOffFallback from "../audio/sfx/button_press_off.mp3";
import wrongPassword from "../audio/sfx/wrong_password.ogg";
import wrongPasswordFallback from "../audio/sfx/wrong_password.mp3";
import asteroidFalling from "../audio/sfx/asteroid_falling.ogg";
import asteroidFallingFallback from "../audio/sfx/asteroid_falling.mp3";
import asteroidImpact from "../audio/sfx/asteroid_impact.ogg";
import asteroidImpactFallback from "../audio/sfx/asteroid_impact.mp3";
import pickUp from "../audio/sfx/pick_up.ogg";
import pickUpFallback from "../audio/sfx/pick_up.mp3";
import drop from "../audio/sfx/drop.ogg";
import dropFallback from "../audio/sfx/drop.mp3";
import intro from "../audio/dialog/intro.ogg";
import introFallback from "../audio/dialog/intro.mp3";
import askAboutJourney from "../audio/dialog/ask_about_journey.ogg";
import askAboutJourneyFallback from "../audio/dialog/ask_about_journey.mp3";
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
import cantCallSomeone from "../audio/dialog/cant_call_someone.ogg";
import cantCallSomeoneFallback from "../audio/dialog/cant_call_someone.mp3";
import cantDisableRemotely from "../audio/dialog/cant_disable_remotely.ogg";
import cantDisableRemotelyFallback from "../audio/dialog/cant_disable_remotely.mp3";
import clarifyAllRovers from "../audio/dialog/clarify_all_rovers.ogg";
import clarifyAllRoversFallback from "../audio/dialog/clarify_all_rovers.mp3";
import confirmKalinaSafe from "../audio/dialog/confirm_kalina_safe.ogg";
import confirmKalinaSafeFallback from "../audio/dialog/confirm_kalina_safe.mp3";
import explainMoonbaseAttack1 from "../audio/dialog/explain_moonbase_attack_1.ogg";
import explainMoonbaseAttack1Fallback from "../audio/dialog/explain_moonbase_attack_1.mp3";
import explainRepairProblem1 from "../audio/dialog/explain_repair_problem_1.ogg";
import explainRepairProblem1Fallback from "../audio/dialog/explain_repair_problem_1.mp3";
import explainShutdownPlan1 from "../audio/dialog/explain_shutdown_plan_1.ogg";
import explainShutdownPlan1Fallback from "../audio/dialog/explain_shutdown_plan_1.mp3";
import jokeDifficultFirstDay from "../audio/dialog/joke_difficult_first_day.ogg";
import jokeDifficultFirstDayFallback from "../audio/dialog/joke_difficult_first_day.mp3";
import kalinaCanHelpFromAfar from "../audio/dialog/kalina_can_help_from_afar.ogg";
import kalinaCanHelpFromAfarFallback from "../audio/dialog/kalina_can_help_from_afar.mp3";
import moonbaseDamageDetails from "../audio/dialog/moonbase_damage_details.ogg";
import moonbaseDamageDetailsFallback from "../audio/dialog/moonbase_damage_details.mp3";
import kalinaInTrouble from "../audio/dialog/kalina_in_trouble.ogg";
import kalinaInTroubleFallback from "../audio/dialog/kalina_in_trouble.mp3";
import ringtone from "../audio/sfx/ringtone.ogg";
import ringtoneFallback from "../audio/sfx/ringtone.mp3";

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

  // TODO(albrow): Sfx for collecting energy cells,
  // opening gates, being destroyed/attacked by malfunctioning rover.
  const soundDict: Record<string, Playable> = useMemo(
    () => ({
      move: new RoundRobinSoundGroup("move", [
        new Sound("move_0", "sfx", [moveSound0, moveSound0Fallback], {
          baseGain: 0.4,
        }),
        new Sound("move_1", "sfx", [moveSound1, moveSound1Fallback], {
          baseGain: 0.4,
        }),
        new Sound("move_2", "sfx", [moveSound2, moveSound2Fallback], {
          baseGain: 0.4,
        }),
        new Sound("move_3", "sfx", [moveSound3, moveSound3Fallback], {
          baseGain: 0.4,
        }),
      ]),
      turn: new RoundRobinSoundGroup("turn", [
        new Sound("turn_0", "sfx", [turnSound0, turnSound0Fallback], {
          baseGain: 0.4,
        }),
        new Sound("turn_1", "sfx", [turnSound1, turnSound1Fallback], {
          baseGain: 0.4,
        }),
        new Sound("turn_2", "sfx", [turnSound2, turnSound2Fallback], {
          baseGain: 0.4,
        }),
        new Sound("turn_3", "sfx", [turnSound3, turnSound3Fallback], {
          baseGain: 0.4,
        }),
      ]),
      bump: new RoundRobinSoundGroup("bump", [
        new Sound("bump_0", "sfx", [bumpSound0, bumpSound0Fallback], {
          baseGain: 0.4,
        }),
        new Sound("bump_1", "sfx", [bumpSound1, bumpSound1Fallback], {
          baseGain: 0.4,
        }),
      ]),
      teleport: new Sound(
        "teleport",
        "sfx",
        [teleportSound, teleportSoundFallback],
        { baseGain: 0.7 }
      ),
      speak: new RoundRobinSoundGroup("speak", [
        new Sound("speak_0", "sfx", [speakSound0, speakSound0Fallback], {
          baseGain: 0.08,
        }),
        new Sound("speak_1", "sfx", [speakSound1, speakSound1Fallback], {
          baseGain: 0.08,
        }),
        new Sound("speak_2", "sfx", [speakSound2, speakSound2Fallback], {
          baseGain: 0.08,
        }),
        new Sound("speak_3", "sfx", [speakSound3, speakSound3Fallback], {
          baseGain: 0.08,
        }),
      ]),
      reading_data: new Sound(
        "reading_data",
        "sfx",
        [readingData, readingDataFallback],
        { baseGain: 0.3 }
      ),
      button_press_on: new Sound(
        "button_press_on",
        "sfx",
        [buttonPressOn, buttonPressOnFallback],
        { baseGain: 0.8 }
      ),
      button_press_off: new Sound(
        "button_press_off",
        "sfx",
        [buttonPressOff, buttonPressOffFallback],
        { baseGain: 0.8 }
      ),
      success: new Sound(
        "success",
        "sfx",
        [successSound, successSoundFallback],
        { baseGain: 1.0 }
      ),
      challenge: new Sound(
        "challenge",
        "sfx",
        [challengeSound, challengeSoundFallback],
        { baseGain: 0.8 }
      ),
      wrong_password: new Sound(
        "wrong_password",
        "sfx",
        [wrongPassword, wrongPasswordFallback],
        { baseGain: 0.5 }
      ),
      asteroid_falling: new Sound(
        "asteroid_falling",
        "sfx",
        [asteroidFalling, asteroidFallingFallback],
        { baseGain: 0.5 }
      ),
      asteroid_impact: new Sound(
        "asteroid_impact",
        "sfx",
        [asteroidImpact, asteroidImpactFallback],
        { baseGain: 0.25 }
      ),
      pick_up: new Sound("pick_up", "sfx", [pickUp, pickUpFallback], {
        baseGain: 0.8,
      }),
      drop: new Sound("drop", "sfx", [drop, dropFallback], { baseGain: 0.8 }),
      ringtone: new Sound("ringtone", "sfx", [ringtone, ringtoneFallback], {
        baseGain: 0.8,
        loop: true,
      }),
      dialog_intro: new Sound(
        "dialog_intro",
        "dialog",
        [intro, introFallback],
        { baseGain: 0.8 }
      ),
      dialog_ask_about_journey: new Sound(
        "dialog_ask_about_journey",
        "dialog",
        [askAboutJourney, askAboutJourneyFallback],
        { baseGain: 0.8 }
      ),
      dialog_journey_neg_response: new Sound(
        "dialog_journey_neg_response",
        "dialog",
        [journeyNegResponse, journeyNegResponseFallback],
        { baseGain: 0.8 }
      ),
      dialog_journey_pos_response: new Sound(
        "dialog_journey_pos_response",
        "dialog",
        [journeyPosResponse, journeyPosResponseFallback],
        { baseGain: 0.8 }
      ),
      dialog_where_i_am: new Sound(
        "dialog_where_i_am",
        "dialog",
        [whereIam, whereIamFallback],
        { baseGain: 0.8 }
      ),
      dialog_who_i_am: new Sound(
        "dialog_who_i_am",
        "dialog",
        [whoIam, whoIamFallback],
        { baseGain: 0.8 }
      ),
      dialog_where_you_are: new Sound(
        "dialog_where_you_are",
        "dialog",
        [whereYouAre, whereYouAreFallback],
        { baseGain: 0.8 }
      ),
      dialog_cant_call_someone: new Sound(
        "dialog_cant_call_someone",
        "dialog",
        [cantCallSomeone, cantCallSomeoneFallback],
        { baseGain: 0.8 }
      ),
      dialog_cant_disable_remotely: new Sound(
        "dialog_cant_disable_remotely",
        "dialog",
        [cantDisableRemotely, cantDisableRemotelyFallback],
        { baseGain: 0.8 }
      ),
      dialog_clarify_all_rovers: new Sound(
        "dialog_clarify_all_rovers",
        "dialog",
        [clarifyAllRovers, clarifyAllRoversFallback],
        { baseGain: 0.8 }
      ),
      dialog_confirm_kalina_safe: new Sound(
        "dialog_confirm_kalina_safe",
        "dialog",
        [confirmKalinaSafe, confirmKalinaSafeFallback],
        { baseGain: 0.8 }
      ),
      dialog_explain_moonbase_attack_1: new Sound(
        "dialog_explain_moonbase_attack_1",
        "dialog",
        [explainMoonbaseAttack1, explainMoonbaseAttack1Fallback],
        { baseGain: 0.8 }
      ),
      dialog_explain_repair_problem_1: new Sound(
        "dialog_explain_repair_problem_1",
        "dialog",
        [explainRepairProblem1, explainRepairProblem1Fallback],
        { baseGain: 0.8 }
      ),
      dialog_explain_shutdown_plan_1: new Sound(
        "dialog_explain_shutdown_plan_1",
        "dialog",
        [explainShutdownPlan1, explainShutdownPlan1Fallback],
        { baseGain: 0.8 }
      ),
      dialog_joke_difficult_first_day: new Sound(
        "dialog_joke_difficult_first_day",
        "dialog",
        [jokeDifficultFirstDay, jokeDifficultFirstDayFallback],
        { baseGain: 0.8 }
      ),
      dialog_kalina_can_help_from_afar: new Sound(
        "dialog_kalina_can_help_from_afar",
        "dialog",
        [kalinaCanHelpFromAfar, kalinaCanHelpFromAfarFallback],
        { baseGain: 0.8 }
      ),
      dialog_moonbase_damage_details: new Sound(
        "dialog_moonbase_damage_details",
        "dialog",
        [moonbaseDamageDetails, moonbaseDamageDetailsFallback],
        { baseGain: 0.8 }
      ),
      dialog_kalina_in_trouble: new Sound(
        "dialog_kalina_in_trouble",
        "dialog",
        [kalinaInTrouble, kalinaInTroubleFallback],
        { baseGain: 0.8 }
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
