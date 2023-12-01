import { Sound } from "./sound";
import { Playable, SoundCategory } from ".";

export class RoundRobinSoundGroup implements Playable {
  readonly id: string;

  readonly category: SoundCategory;

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
   * The category will be the same as the category for the first sound in the list.
   *
   * @param id A unique identifier for the group.
   * @param sounds A list of sounds to be played in a round-robin fashion.
   */
  constructor(id: string, sounds: Array<Sound>) {
    this.id = id;
    this.category = sounds[0].category;
    sounds.forEach((sound) => {
      if (sound.category !== this.category) {
        throw new Error(
          `Can't create RoundRobin group with different categories. Sound ${sound.id} does not belong to category ${this.category}.`
        );
      }
    });
    this._sounds = sounds;
    this._currentSoundIndex = 0;
  }

  setCatGain(gain: number): void {
    this._sounds.forEach((sound) => sound.setCatGain(gain));
  }

  play(fadeIn?: number): void {
    this._sounds[this._currentSoundIndex].play(fadeIn);
    this._currentSoundIndex =
      (this._currentSoundIndex + 1) % this._sounds.length;
  }

  pause(): void {
    this._sounds[this._currentSoundIndex].pause();
  }

  stop(fadeOut?: number): void {
    this._sounds.forEach((sound) => sound.stop(fadeOut));
  }

  mute(): void {
    this._sounds.forEach((sound) => sound.mute());
  }

  unmute(): void {
    this._sounds.forEach((sound) => sound.unmute());
  }

  isPlaying(): boolean {
    return this._sounds[this._currentSoundIndex].isPlaying();
  }

  unload(): void {
    this._sounds.forEach((sound) => sound.unload());
  }
}
