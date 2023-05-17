import { Sound } from "./sound";
import { Playable } from ".";

/**

 */
export class RoundRobinSoundGroup implements Playable {
  private _id: string;

  private _sounds: Array<Sound>;

  private _currentSoundIndex: number;

  /**
   * Creates a group of sounds that are played in a round-robin fashion.
   *
   * For example, if you have a group of sounds [A, B, C], then
   * the first time you call play(), A will play. The second time
   * you call play(), B will play. The third time you call play(),
   * C will play. The fourth time you call play(), A will play again.
   *
   * This helps make sound effects feel more organic and less repetitive.
   *
   * @param id A unique identifier for the group.
   * @param sounds A list of sounds to be played in a round-robin fashion.
   */
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
