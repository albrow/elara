import { Playable } from ".";

export class Sound implements Playable {
  private _id: string;

  private _ref: React.RefObject<HTMLAudioElement>;

  private _audioContext: AudioContext | undefined;

  private _source: MediaElementAudioSourceNode | undefined;

  /**
   * This is the most basic implementation of Playable.
   *
   * @param id A unique identifier for the sound.
   * @param ref A reference to the HTML audio element.
   */
  constructor(id: string, ref: React.RefObject<HTMLAudioElement>) {
    this._id = id;
    this._ref = ref;
  }

  isLoaded() {
    return this._audioContext != null;
  }

  private load() {
    if (this.isLoaded()) {
      return;
    }
    if (!this._ref.current) {
      throw new Error(`Audio element for sound "${this._id}" not found`);
    }
    this._audioContext = new AudioContext();
    this._source = this._audioContext.createMediaElementSource(
      this._ref.current
    );
    this._source.connect(this._audioContext.destination);
  }

  play() {
    this.load();
    this._ref.current?.play();
  }

  replay() {
    this.load();
    this._ref.current?.fastSeek(0);
    this._ref.current?.play();
  }

  pause() {
    this.load();
    this._ref.current?.pause();
  }

  stop() {
    this.load();
    this._ref.current?.pause();
    this._ref.current?.fastSeek(0);
  }

  unload() {
    this._audioContext?.close();
    this._audioContext = undefined;
    this._source = undefined;
  }
}
