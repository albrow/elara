import { Howl } from "howler";

import { Playable, SoundCategory } from ".";

export class Sound implements Playable {
  readonly id: string;

  readonly category: SoundCategory;

  private _sources: string[];

  private _baseGain: number;

  private _catGain: number;

  private _howl: Howl;

  /**
   * This is the most basic implementation of Playable.
   *
   * @param id A unique identifier for the sound.
   * @param category The category that the sound belongs to, i.e. "sfx", "music", "dialog"
   * @param sources An array of source URLs for the sound
   * @param baseGain The "base" or "internal" gain of the sound, from 0.0 to 1.0 (default 1.0).
   *    Independent of other volume controls. This is useful for adjusting specific sounds that
   *    are too loud or too quiet.
   * @param catGain The "category" or "external" gain of the sound, from 0.0 to 1.0 (default 1.0).
   *    This is useful for adjusting the volume of a group of sounds together, i.e. having separate volume
   *    controls for sound effects, music, etc.
   */
  constructor(
    id: string,
    category: SoundCategory,
    sources: string[],
    baseGain: number = 1.0,
    catGain: number = 1.0
  ) {
    this.id = id;
    this.category = category;
    this._sources = sources;
    this._baseGain = baseGain;
    this._catGain = catGain;
    this._howl = new Howl({
      src: this._sources,
      volume: this._baseGain * this._catGain,
    });
  }

  setCatGain(gain: number): void {
    this._catGain = gain;
    if (this._howl) {
      this._howl.fade(this._howl.volume(), this._baseGain * this._catGain, 10);
    }
  }

  mute() {
    this._howl?.mute(true);
  }

  unmute() {
    this._howl?.mute(false);
  }

  play() {
    this._howl?.play();
  }

  pause() {
    this._howl?.pause();
  }

  stop() {
    this._howl?.stop();
  }
}
