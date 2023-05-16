import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import * as Pizzicato from "pizzicato";

import { useRouteNode } from "react-router5";
import moveSound from "../../sounds/move.mp3";

interface Sound {
  name: string;
  type: "music" | "sfx";
  sound: Pizzicato.Sound;
}

async function loadFile(
  name: string,
  type: "music" | "sfx",
  filename: string
): Promise<Sound> {
  return new Promise((resolve, reject) => {
    const sound = new Pizzicato.Sound(
      {
        source: "file",
        options: {
          path: filename,
          loop: true,
        },
      },
      (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            name,
            type,
            sound,
          });
        }
      }
    );
  });
}

const soundDict: Record<string, Sound> = {};
// An array of currently playing sound effects. The sound manager will stop
// these automatically when navigating between pages.
const currSoundEffects: Pizzicato.Sound[] = [];

export async function loadAllSounds() {
  soundDict.move = await loadFile("move", "sfx", moveSound);
}

// getSound is used when you need more control over the sound (e.g. need
// to play, pause, stop, or add effects).
function getSound(name: string) {
  if (!(name in soundDict)) {
    throw new Error(
      `Unknown sound: ${name}. Did you remember to call loadAllSounds()?`
    );
  }
  const sound = soundDict[name].sound.clone();
  if (soundDict[name].type === "sfx") {
    currSoundEffects.push(sound);
  }
  return sound;
}

// playSound is used when you just need to play the sound and you don't care
// about controlling it.
function playSound(name: string) {
  const sound = getSound(name);
  if (soundDict[name].type === "sfx") {
    currSoundEffects.push(sound);
  }
  sound.play();
}

export const SoundManagerContext = createContext<
  readonly [(name: string) => void, (name: string) => Pizzicato.Sound]
>([
  () => {
    throw new Error("useSound must be used within a SoundManagerContext");
  },
  () => {
    throw new Error("useSound must be used within a SoundManagerContext");
  },
] as const);

export const stopAllSoundEffects = () => {
  currSoundEffects.forEach((sound) => sound.stop());
  currSoundEffects.length = 0;
};

// A custom hook for managing music and sound effects.
export const useSound = () => useContext(SoundManagerContext);

export function SoundProvider(props: PropsWithChildren<{}>) {
  const providerValue = useMemo(() => [playSound, getSound] as const, []);

  // When the route changes, stop all sound effects.
  const { route } = useRouteNode("");
  useEffect(() => {
    stopAllSoundEffects();
  }, [route]);

  return (
    <SoundManagerContext.Provider value={providerValue}>
      {props.children}
    </SoundManagerContext.Provider>
  );
}
