import { Playable } from ".";

export class Sound implements Playable {
  private _audioContext: AudioContext;

  private _id: string;

  private _ref: React.RefObject<HTMLAudioElement>;

  private _baseGain: number;

  private _groupGain: number;

  private _source: MediaElementAudioSourceNode | undefined;

  private _gainNode: GainNode | undefined;

  /**
   * This is the most basic implementation of Playable.
   *
   * @param audioContext The AudioContext to use for playing the sound.
   * @param id A unique identifier for the sound.
   * @param ref A reference to the HTML audio element.
   * @param baseGain The "base" or "internal" gain of the sound, from 0.0 to 1.0 (default 1.0).
   *    Independent of other volume controls. This is useful for adjusting specific sounds that
   *    are too loud or too quiet.
   * @param groupGain The "group" or "external" gain of the sound, from 0.0 to 1.0 (default 1.0).
   *    This is useful for adjusting the volume of a group of sounds together, i.e. having separate volume
   *    controls for sound effects, music, etc.
   */
  constructor(
    audioContext: AudioContext,
    id: string,
    ref: React.RefObject<HTMLAudioElement>,
    baseGain: number = 1.0,
    groupGain: number = 1.0
  ) {
    this._audioContext = audioContext;
    this._id = id;
    this._ref = ref;
    this._baseGain = baseGain;
    this._groupGain = groupGain;
  }

  isLoaded() {
    return this._source != null;
  }

  load() {
    if (this.isLoaded()) {
      return;
    }
    if (!this._ref.current) {
      throw new Error(`Audio element for sound "${this._id}" not found`);
    }
    this._source = new MediaElementAudioSourceNode(this._audioContext, {
      mediaElement: this._ref.current,
    });
    this._gainNode = this._audioContext.createGain();
    this._gainNode.gain.value = this._baseGain * this._groupGain;
    this._source
      .connect(this._gainNode)
      .connect(this._audioContext.destination);
  }

  setGroupGain(gain: number): void {
    this._groupGain = gain;
    if (this._gainNode) {
      this._gainNode.gain.value = this._baseGain * this._groupGain;
    }
  }

  play() {
    this.load();
    if (this._audioContext.state === "suspended") {
      // See: https://developer.chrome.com/blog/autoplay/#web-audio
      this._audioContext.resume();
    }
    this._ref.current?.play();
  }

  private seek(time: number) {
    if (this._ref.current) {
      if (this._ref.current.fastSeek) {
        this._ref.current.fastSeek(time);
      } else {
        this._ref.current.currentTime = time;
      }
    }
  }

  replay() {
    this.load();
    if (this._audioContext.state === "suspended") {
      // See: https://developer.chrome.com/blog/autoplay/#web-audio
      this._audioContext.resume();
    }
    this.seek(0);
    this._ref.current?.play();
  }

  pause() {
    this.load();
    this._ref.current?.pause();
  }

  stop() {
    this.load();
    this._ref.current?.pause();
    this.seek(0);
  }
}
