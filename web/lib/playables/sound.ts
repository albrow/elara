import { Howl } from "howler";

import { Playable, SoundCategory } from ".";

export class Sound implements Playable {
  readonly id: string;

  readonly category: SoundCategory;

  private _sources: string[];

  private _baseGain: number;

  private _catGain: number;

  private _howl: Howl;

  private _loop: boolean;

  private _fadeIn: number;

  /**
   * This is the most basic implementation of Playable.
   *
   * @param id A unique identifier for the sound.
   * @param category The category that the sound belongs to, i.e. "sfx", "music", "dialog"
   * @param sources An array of source URLs for the sound
   * @param baseGain The "base" or "internal" gain of the sound, from 0.0 to 1.0 (default 1.0).
   *    Independent of other volume controls. This is useful for adjusting specific sounds that
   *    are too loud or too quiet.
   * @param loop Whether or not the sound should loop (default false).
   * @param fadeIn Number of milliseconds to fade the sound in when playing it.
   */
  constructor(
    id: string,
    category: SoundCategory,
    sources: string[],
    baseGain: number = 1.0,
    loop: boolean = false,
    fadeIn: number = 0.0
  ) {
    this.id = id;
    this.category = category;
    this._sources = sources;
    this._baseGain = baseGain;
    this._catGain = 1.0;
    this._loop = loop;
    this._fadeIn = fadeIn;
    this._howl = new Howl({
      src: this._sources,
      volume: this._baseGain,
      loop: this._loop,
    });
  }

  private _getTotalGain(): number {
    return this._baseGain * this._catGain;
  }

  setCatGain(gain: number): void {
    this._catGain = gain;
    if (this._howl) {
      this._howl.fade(this._howl.volume(), this._getTotalGain(), 10);
    }
  }

  mute() {
    this._howl?.mute(true);
  }

  unmute() {
    this._howl?.mute(false);
  }

  play(fadeIn?: number) {
    const fadeInVal = fadeIn ?? this._fadeIn;
    if (fadeInVal > 0) {
      this._howl.volume(0);
    }
    this._howl?.play();
    if (fadeInVal > 0) {
      this._howl.fade(0, this._getTotalGain(), fadeInVal);
    }
  }

  pause() {
    this._howl?.pause();
  }

  stop(fadeOut?: number) {
    if (fadeOut && fadeOut > 0) {
      this._howl?.fade(this._getTotalGain(), 0, fadeOut).once("fade", () => {
        this._howl?.stop();
        this._howl?.volume(this._getTotalGain());
      });
    } else {
      this._howl?.stop();
    }
  }

  isPlaying(): boolean {
    return this._howl?.playing() ?? false;
  }
}
