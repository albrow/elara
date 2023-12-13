import { Howl } from "howler";

import { Playable, SoundCategory } from ".";

export interface SoundOptions {
  /**
   * The "base" or "internal" gain of the sound, from 0.0 to 1.0 (default 1.0).
   * Independent of other volume controls. This is useful for adjusting specific
   * sounds that are too loud or too quiet.
   */
  baseGain?: number;
  /** Whether or not the sound should loop (default false). */
  loop?: boolean;
  /** Number of milliseconds to fade the sound in when playing it (default 0). */
  fadeIn?: number;
  /**
   * Whether or not the sound should be preloaded (default true). If true, the sound
   * will be loaded immediately, but will not be played until play() is called. If false,
   * the sound will be loaded when play() is called.
   */
  preload?: boolean;
  /** Whether or not the sound should be streamed (default false).
   * Streamed sounds will start playing before the entire song has loaded,
   * but will not loop seamlessly.
   */
  stream?: boolean;
}

export class Sound implements Playable {
  readonly id: string;

  readonly category: SoundCategory;

  private _sources: string[];

  private _baseGain: number;

  private _catGain: number;

  private _howl: Howl;

  private _loop: boolean;

  private _fadeIn: number;

  private _preload: boolean;

  private _stream: boolean;

  /**
   * This is the most basic implementation of Playable.
   *
   * @param id A unique identifier for the sound.
   * @param category The category that the sound belongs to, i.e. "sfx", "music", "dialog"
   * @param sources An array of source URLs for the sound
   * @param baseGain
   * @param loop Whether or not the sound should loop (default false).
   * @param fadeIn Number of milliseconds to fade the sound in when playing it.
   */
  constructor(
    id: string,
    category: SoundCategory,
    sources: string[],
    opts: SoundOptions = {}
  ) {
    this.id = id;
    this.category = category;
    this._sources = sources;
    this._baseGain = opts.baseGain || 1.0;
    this._catGain = 1.0;
    this._loop = opts.loop || false;
    this._fadeIn = opts.fadeIn || 0;
    this._preload = opts.preload === undefined ? true : opts.preload;
    this._stream = opts.stream === undefined ? false : opts.stream;
    this._howl = new Howl({
      src: this._sources,
      volume: this._baseGain,
      loop: this._loop,
      // Note: This is effectively the option in Howler.js that enables streaming.
      html5: this._stream,
      preload: this._preload,
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
    if (this._howl?.state() === "loaded") {
      this._howl?.play();
    } else {
      this._howl?.once("load", () => {
        this._howl?.play();
      });
      this._howl?.load();
    }
    if (fadeInVal > 0) {
      this._howl?.once("play", () => {
        this._howl.fade(0, this._getTotalGain(), fadeInVal);
      });
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

  unload() {
    this._howl?.unload();
  }

  isPlaying(): boolean {
    return this._howl?.playing() ?? false;
  }
}
