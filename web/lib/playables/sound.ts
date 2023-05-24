import { Howl } from "howler";

import { Playable } from ".";

export class Sound implements Playable {
  private _id: string;

  private _sources: string[];

  private _baseGain: number;

  private _groupGain: number;

  private _howl: Howl;

  /**
   * This is the most basic implementation of Playable.
   *
   * @param id A unique identifier for the sound.
   * @param sources An array of source URLs for the sound
   * @param baseGain The "base" or "internal" gain of the sound, from 0.0 to 1.0 (default 1.0).
   *    Independent of other volume controls. This is useful for adjusting specific sounds that
   *    are too loud or too quiet.
   * @param groupGain The "group" or "external" gain of the sound, from 0.0 to 1.0 (default 1.0).
   *    This is useful for adjusting the volume of a group of sounds together, i.e. having separate volume
   *    controls for sound effects, music, etc.
   */
  constructor(
    id: string,
    sources: string[],
    baseGain: number = 1.0,
    groupGain: number = 1.0
  ) {
    this._id = id;
    this._sources = sources;
    this._baseGain = baseGain;
    this._groupGain = groupGain;
    this._howl = new Howl({
      src: this._sources,
      volume: this._baseGain * this._groupGain,
    });
  }

  setGroupGain(gain: number): void {
    // TODO(albrow): Fade instead of instant change?
    this._groupGain = gain;
    if (this._howl) {
      this._howl.volume(this._baseGain * this._groupGain);
    }
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
