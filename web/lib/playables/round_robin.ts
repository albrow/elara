import { Sound } from "./sound";
import { Playable } from ".";

export class RoundRobinPlayable implements Playable {
  private _id: string;

  private _sounds: Array<Sound>;

  private _currentSoundIndex: number;

  constructor(id: string, sounds: Array<Sound>) {
    this._id = id;
    this._sounds = sounds;
    this._currentSoundIndex = 0;
  }

  play(): void {
    this._sounds[this._currentSoundIndex].play();
    this._currentSoundIndex =
      (this._currentSoundIndex + 1) % this._sounds.length;
  }

  replay(): void {
    this._sounds[this._currentSoundIndex].replay();
    this._currentSoundIndex =
      (this._currentSoundIndex + 1) % this._sounds.length;
  }

  pause(): void {
    this._sounds[this._currentSoundIndex].pause();
  }

  stop(): void {
    this._sounds.forEach((sound) => sound.stop());
  }

  isLoaded(): boolean {
    return this._sounds.every((sound) => sound.isLoaded());
  }

  unload(): void {
    this._sounds.forEach((sound) => sound.unload());
  }
}
